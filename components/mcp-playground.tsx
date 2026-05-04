'use client'

import { useState } from 'react'

type JsonRpcResponse = {
  jsonrpc: '2.0'
  id: string | number | null
  result?: unknown
  error?: {
    code: number
    message: string
  }
}

type MCPPlaygroundProps = {
  onShiftCreatedSuccess?: () => Promise<void> | void
}

async function callMcp(method: string, params?: Record<string, unknown>) {
  const response = await fetch('/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method,
      params,
    }),
  })

  return (await response.json()) as JsonRpcResponse
}

function getToolPayload(response: JsonRpcResponse): unknown {
  if (!response.result || typeof response.result !== 'object') return null

  const resultRecord = response.result as { content?: Array<{ type?: string; text?: string }> }
  const textPayload = resultRecord.content?.find((item) => item.type === 'text')?.text
  if (!textPayload) return null

  try {
    return JSON.parse(textPayload)
  } catch {
    return textPayload
  }
}

function isSuccessfulShiftCreation(response: JsonRpcResponse) {
  if (response.error) return false
  const payload = getToolPayload(response)
  if (!payload || typeof payload !== 'object') return false

  return (payload as { ok?: boolean }).ok === true
}

export function MCPPlayground({ onShiftCreatedSuccess }: MCPPlaygroundProps) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowDate = tomorrow.toISOString().slice(0, 10)

  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [output, setOutput] = useState<Array<{ label: string; payload: unknown }>>([])
  const [officeNameOrId, setOfficeNameOrId] = useState('2nd Floor')
  const [staffNameOrId, setStaffNameOrId] = useState('Gomez, Ricardo')
  const [date, setDate] = useState(tomorrowDate)
  const [schedule, setSchedule] = useState('6:30 PM - 9:30 PM')
  const [requestText, setRequestText] = useState(
    `Create a shift for Gomez, Ricardo on ${tomorrowDate} at 2nd Floor from 6:30 PM - 9:30 PM`
  )

  const runHandshakeTest = async () => {
    setLoadingAction('handshake')
    try {
      const init = await callMcp('initialize', {
        clientInfo: { name: 'ui-tester', version: '0.1.0' },
      })
      const list = await callMcp('tools/list')
      const ping = await callMcp('tools/call', {
        name: 'ping',
        arguments: { message: 'test from scheduling app' },
      })
      setOutput([
        { label: 'initialize', payload: init },
        { label: 'tools/list', payload: list },
        { label: 'tools/call ping', payload: ping },
      ])
    } finally {
      setLoadingAction(null)
    }
  }

  const runContextTest = async () => {
    setLoadingAction('context')
    try {
      const context = await callMcp('tools/call', {
        name: 'get_shift_creation_context',
        arguments: { officeNameOrId, date },
      })
      setOutput([{ label: 'tools/call get_shift_creation_context', payload: context }])
    } finally {
      setLoadingAction(null)
    }
  }

  const runCreateShift = async () => {
    setLoadingAction('create_shift')
    try {
      const created = await callMcp('tools/call', {
        name: 'create_shift',
        arguments: {
          officeNameOrId,
          staffNameOrId,
          date,
          schedule,
        },
      })
      setOutput([{ label: 'tools/call create_shift', payload: created }])

      if (isSuccessfulShiftCreation(created)) {
        await onShiftCreatedSuccess?.()
      }
    } finally {
      setLoadingAction(null)
    }
  }

  const runCreateFromRequest = async () => {
    setLoadingAction('create_shift_from_request')
    try {
      const created = await callMcp('tools/call', {
        name: 'create_shift_from_request',
        arguments: { requestText },
      })
      setOutput([{ label: 'tools/call create_shift_from_request', payload: created }])

      if (isSuccessfulShiftCreation(created)) {
        await onShiftCreatedSuccess?.()
      }
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <section className="mx-4 my-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">MCP Test Playground</h2>
        <button
          type="button"
          onClick={runHandshakeTest}
          disabled={loadingAction !== null}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === 'handshake' ? 'Running...' : 'Run Handshake Test'}
        </button>
      </div>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        <input
          value={officeNameOrId}
          onChange={(event) => setOfficeNameOrId(event.target.value)}
          placeholder="Office name or ID"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs"
        />
        <input
          value={staffNameOrId}
          onChange={(event) => setStaffNameOrId(event.target.value)}
          placeholder="Staff name or ID"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs"
        />
        <input
          value={date}
          onChange={(event) => setDate(event.target.value)}
          placeholder="YYYY-MM-DD"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs"
        />
        <input
          value={schedule}
          onChange={(event) => setSchedule(event.target.value)}
          placeholder="h:mm AM - h:mm PM"
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs"
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runContextTest}
          disabled={loadingAction !== null}
          className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 border border-neutral-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === 'context' ? 'Loading...' : 'Fetch Context + Availability'}
        </button>
        <button
          type="button"
          onClick={runCreateShift}
          disabled={loadingAction !== null}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingAction === 'create_shift' ? 'Creating...' : 'Create Shift (Explicit)'}
        </button>
      </div>

      <textarea
        value={requestText}
        onChange={(event) => setRequestText(event.target.value)}
        placeholder="Natural language request"
        className="mb-3 min-h-20 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs"
      />
      <button
        type="button"
        onClick={runCreateFromRequest}
        disabled={loadingAction !== null}
        className="mb-3 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === 'create_shift_from_request'
          ? 'Creating...'
          : 'Create Shift (Natural Language)'}
      </button>

      <pre className="max-h-72 overflow-auto rounded-md bg-white p-3 text-xs text-neutral-800">
        {output.length === 0
          ? 'Use the buttons above to test MCP tools from the UI.'
          : JSON.stringify(output, null, 2)}
      </pre>
    </section>
  )
}
