'use client'

import { useEffect, useState } from 'react'
import { Building2, Users, Plus } from 'lucide-react'
import type { PanelType } from '../LightshotBar'

type ActionType = Exclude<PanelType, 'ai' | null>

interface AIResponse {
  suggestion: string
  chips: { action: ActionType; label: string }[]
}

interface AIPanelProps {
  query: string
  onAction: (action: ActionType) => void
}

const CHIP_ICON = { shift: Plus, people: Users, offices: Building2 }
const CHIP_COLOR = { shift: '#3d52a0', people: '#059669', offices: '#d97706' }

export function AIPanel({ query, onAction }: AIPanelProps) {
  const [loading, setLoading] = useState(true)
  const [response, setResponse] = useState<AIResponse | null>(null)

  useEffect(() => {
    setLoading(true)
    setResponse(null)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/schedule-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })
        setResponse(await res.json())
      } catch {
        setResponse({
          suggestion: 'I can help you manage scheduling. Try creating a shift, browsing staff availability, or checking office coverage.',
          chips: [
            { action: 'shift', label: 'Create Shift' },
            { action: 'people', label: 'Browse People' },
            { action: 'offices', label: 'Check Offices' },
          ],
        })
      } finally {
        setLoading(false)
      }
    }, 900)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(109,91,200,0.15), rgba(61,82,160,0.15))', border: '1px solid rgba(109,91,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '13px' }}>✦</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '5px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6d5bc8', animation: `ls-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>Thinking…</span>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#1a1f36', lineHeight: '1.5', marginBottom: '12px' }}>
              {response?.suggestion}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {response?.chips.map(chip => {
                const Icon = CHIP_ICON[chip.action]
                const color = CHIP_COLOR[chip.action]
                return (
                  <button
                    key={chip.action}
                    onClick={() => onAction(chip.action)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: `1px solid ${color}30`, background: `${color}10`, color, fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}20` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${color}10` }}
                  >
                    <Icon size={12} />
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
