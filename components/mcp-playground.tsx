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

export function MCPPlayground() {
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState<JsonRpcResponse[]>([])

  const runTest = async () => {
    setLoading(true)
    try {
      const init = await callMcp('initialize', {
        clientInfo: { name: 'ui-tester', version: '0.1.0' },
      })
      const list = await callMcp('tools/list')
      const ping = await callMcp('tools/call', {
        name: 'ping',
        arguments: { message: 'test from scheduling app' },
      })
      setOutput([init, list, ping])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-4 my-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">MCP Test Playground</h2>
        <button
          type="button"
          onClick={runTest}
          disabled={loading}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Running...' : 'Run MCP test'}
        </button>
      </div>

      <pre className="max-h-72 overflow-auto rounded-md bg-white p-3 text-xs text-neutral-800">
        {output.length === 0
          ? 'Press "Run MCP test" to call initialize, tools/list and tools/call.'
          : JSON.stringify(output, null, 2)}
      </pre>
    </section>
  )
}
