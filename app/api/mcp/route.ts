import { NextResponse } from 'next/server'
import {
  analyzeShiftRequest,
  createShift,
  createShiftFromRequest,
  getShiftCreationContext,
} from '@/lib/api/teambuilder-service'

type JsonRpcRequest = {
  jsonrpc?: string
  id?: string | number | null
  method?: string
  params?: Record<string, unknown>
}

const TOOL_DEFINITIONS = [
  {
    name: 'ping',
    description: 'Returns a pong message for connectivity checks.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Optional custom message.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'get_current_date',
    description: 'Returns server current date and time in ISO format.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'get_shift_creation_context',
    description:
      'Returns offices and staff options required to create shifts, and optionally staff availability by office/date.',
    inputSchema: {
      type: 'object',
      properties: {
        officeNameOrId: {
          type: 'string',
          description: 'Optional office name or UUID to resolve availability context.',
        },
        date: {
          type: 'string',
          description: 'Optional date in YYYY-MM-DD to fetch availability for the office.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'analyze_shift_request',
    description:
      'Analyzes free text and detects whether the user is trying to create a shift, including parsed fields.',
    inputSchema: {
      type: 'object',
      properties: {
        requestText: {
          type: 'string',
          description: 'Free-text request from the user.',
        },
      },
      required: ['requestText'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_shift',
    description: 'Creates a shift from explicit office, staff, date, and schedule.',
    inputSchema: {
      type: 'object',
      properties: {
        officeNameOrId: {
          type: 'string',
          description: 'Office name or UUID.',
        },
        staffNameOrId: {
          type: 'string',
          description: 'Staff name or UUID.',
        },
        date: {
          type: 'string',
          description: 'Shift date in YYYY-MM-DD format.',
        },
        schedule: {
          type: 'string',
          description: 'Schedule in h:mm AM - h:mm PM format.',
        },
      },
      required: ['officeNameOrId', 'staffNameOrId', 'date', 'schedule'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_shift_from_request',
    description:
      'Parses a natural-language user request, maps office/staff/date/schedule, and creates a shift when unambiguous.',
    inputSchema: {
      type: 'object',
      properties: {
        requestText: {
          type: 'string',
          description: 'Free-text request from the user.',
        },
      },
      required: ['requestText'],
      additionalProperties: false,
    },
  },
]

function jsonRpcResult(id: JsonRpcRequest['id'], result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result })
}

function jsonRpcError(id: JsonRpcRequest['id'], code: number, message: string) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message },
  })
}

function jsonToolContent(payload: unknown) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2),
      },
    ],
  }
}

export async function POST(request: Request) {
  let body: JsonRpcRequest

  try {
    body = (await request.json()) as JsonRpcRequest
  } catch {
    return jsonRpcError(null, -32700, 'Invalid JSON payload.')
  }

  if (body.jsonrpc !== '2.0' || !body.method) {
    return jsonRpcError(body.id ?? null, -32600, 'Invalid JSON-RPC request.')
  }

  if (body.method === 'initialize') {
    return jsonRpcResult(body.id, {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: 'scheduling-app-mcp',
        version: '0.1.0',
      },
      capabilities: {
        tools: {},
      },
    })
  }

  if (body.method === 'tools/list') {
    return jsonRpcResult(body.id, {
      tools: TOOL_DEFINITIONS,
    })
  }

  if (body.method === 'tools/call') {
    const name = String(body.params?.name ?? '')
    const args = (body.params?.arguments ?? {}) as Record<string, unknown>

    if (name === 'ping') {
      const message = typeof args.message === 'string' ? args.message : 'hello from client'

      return jsonRpcResult(body.id, {
        content: [
          {
            type: 'text',
            text: `pong: ${message}`,
          },
        ],
      })
    }

    if (name === 'get_current_date') {
      return jsonRpcResult(body.id, {
        content: [
          {
            type: 'text',
            text: new Date().toISOString(),
          },
        ],
      })
    }

    if (name === 'get_shift_creation_context') {
      const officeNameOrId = typeof args.officeNameOrId === 'string' ? args.officeNameOrId : undefined
      const date = typeof args.date === 'string' ? args.date : undefined

      try {
        const context = await getShiftCreationContext({ officeNameOrId, date })
        return jsonRpcResult(body.id, jsonToolContent(context))
      } catch (error) {
        return jsonRpcError(
          body.id,
          -32000,
          error instanceof Error ? error.message : 'Failed to load shift creation context.'
        )
      }
    }

    if (name === 'create_shift') {
      const officeNameOrId = typeof args.officeNameOrId === 'string' ? args.officeNameOrId : ''
      const staffNameOrId = typeof args.staffNameOrId === 'string' ? args.staffNameOrId : ''
      const date = typeof args.date === 'string' ? args.date : ''
      const schedule = typeof args.schedule === 'string' ? args.schedule : ''

      if (!officeNameOrId || !staffNameOrId || !date || !schedule) {
        return jsonRpcError(
          body.id,
          -32602,
          'Invalid arguments for create_shift. Required: officeNameOrId, staffNameOrId, date, schedule.'
        )
      }

      try {
        const createdShift = await createShift({
          officeNameOrId,
          staffNameOrId,
          date,
          schedule,
        })
        return jsonRpcResult(body.id, jsonToolContent({ ok: true, createdShift }))
      } catch (error) {
        return jsonRpcError(
          body.id,
          -32001,
          error instanceof Error ? error.message : 'Failed to create shift.'
        )
      }
    }

    if (name === 'analyze_shift_request') {
      const requestText = typeof args.requestText === 'string' ? args.requestText : ''
      if (!requestText) {
        return jsonRpcError(
          body.id,
          -32602,
          'Invalid arguments for analyze_shift_request. Required: requestText.'
        )
      }

      try {
        const analysis = analyzeShiftRequest(requestText)
        return jsonRpcResult(body.id, jsonToolContent(analysis))
      } catch (error) {
        return jsonRpcError(
          body.id,
          -32003,
          error instanceof Error ? error.message : 'Failed to analyze shift request.'
        )
      }
    }

    if (name === 'create_shift_from_request') {
      const requestText = typeof args.requestText === 'string' ? args.requestText : ''
      if (!requestText) {
        return jsonRpcError(
          body.id,
          -32602,
          'Invalid arguments for create_shift_from_request. Required: requestText.'
        )
      }

      try {
        const result = await createShiftFromRequest(requestText)
        return jsonRpcResult(body.id, jsonToolContent(result))
      } catch (error) {
        return jsonRpcError(
          body.id,
          -32002,
          error instanceof Error ? error.message : 'Failed to parse request and create shift.'
        )
      }
    }

    return jsonRpcError(body.id, -32601, `Unknown tool "${name}".`)
  }

  return jsonRpcError(body.id, -32601, `Unknown method "${body.method}".`)
}
