import { NextResponse } from 'next/server'

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

    return jsonRpcError(body.id, -32601, `Unknown tool "${name}".`)
  }

  return jsonRpcError(body.id, -32601, `Unknown method "${body.method}".`)
}
