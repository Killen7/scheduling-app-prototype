'use client'

import { X } from 'lucide-react'
import type { StaffMember } from '@/lib/storage'
import type { PersonData } from '../LightshotBar'

const WEEK_DAYS = [
  { label: 'Mon', date: '2026-05-04' },
  { label: 'Tue', date: '2026-05-05' },
  { label: 'Wed', date: '2026-05-06' },
  { label: 'Thu', date: '2026-05-07' },
  { label: 'Fri', date: '2026-05-08' },
  { label: 'Sat', date: '2026-05-09' },
  { label: 'Sun', date: '2026-05-10' },
]

const TODAY = '2026-05-04'
const WEEKEND = new Set(['2026-05-09', '2026-05-10'])

const ROW_DEFS = [
  { key: 'shifts',       label: 'Shifts',       accent: '#3d52a0', bg: 'rgba(61,82,160,0.1)',  border: 'solid rgba(61,82,160,0.25)',  striped: false },
  { key: 'callouts',     label: 'Callouts',     accent: '#d97706', bg: '',                     border: 'solid rgba(217,119,6,0.2)',   striped: true  },
  { key: 'requests',     label: 'Requests',     accent: '#6d5bc8', bg: 'transparent',          border: 'dashed rgba(61,82,160,0.35)', striped: false },
  { key: 'availability', label: 'Availability', accent: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'solid rgba(5,150,105,0.2)',   striped: false },
  { key: 'pto',          label: 'PTO',          accent: '#dc2626', bg: 'rgba(220,38,38,0.07)', border: 'solid rgba(220,38,38,0.15)',  striped: false },
] as const

function seededBool(name: string, row: string, date: string): boolean {
  let h = 0
  for (const c of name + row + date) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff
  const n = Math.abs(h)
  if (row === 'callouts')     return n % 8 === 0
  if (row === 'requests')     return n % 5 === 0
  if (row === 'availability') return n % 3 !== 0
  if (row === 'pto')          return n % 12 === 0
  return false
}

const AVAIL_COLOR = { available: '#059669', partial: '#d97706', busy: '#dc2626' }

interface PersonPeekProps {
  person: PersonData
  staff: StaffMember[]
  onDismiss: () => void
}

export function PersonPeek({ person, staff, onDismiss }: PersonPeekProps) {
  const shiftByDate: Record<string, string> = {}
  staff.filter(m => m.name === person.name).forEach(m => { shiftByDate[m.date] = m.schedule })

  const color = AVAIL_COLOR[person.availability]

  const hasCell = (rowKey: string, date: string) => {
    if (rowKey === 'shifts') return !!shiftByDate[date]
    if (WEEKEND.has(date)) return false
    return seededBool(person.name, rowKey, date)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 10, borderRadius: '16px', overflow: 'hidden', animation: 'ls-peek-in 0.2s cubic-bezier(0.34,1.2,0.64,1)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color, flexShrink: 0 }}>
          {person.name.split(',')[0].slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1f36' }}>{person.name}</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>{person.title} · {person.location}</div>
        </div>
        <button
          onClick={onDismiss}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', fontSize: '10px', color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <X size={10} /> ESC to close
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '3px', alignItems: 'center' }}>
          {/* Column headers */}
          <div />
          {WEEK_DAYS.map(day => (
            <div key={day.date} style={{ textAlign: 'center', padding: '3px 2px 6px', borderBottom: '1px solid rgba(0,0,0,0.07)', fontSize: '10px', fontWeight: 600, color: day.date === TODAY ? '#3d52a0' : '#6b7280' }}>
              {day.label}
            </div>
          ))}

          {/* Data rows */}
          {ROW_DEFS.map(row => (
            <div key={row.key} style={{ display: 'contents' }}>
              {/* Row label */}
              <div style={{ borderLeft: `2px solid ${row.accent}`, paddingLeft: '6px', display: 'flex', alignItems: 'center', height: '28px', fontSize: '10px', fontWeight: 600, color: '#6b7280' }}>
                {row.label}
              </div>
              {/* Day cells */}
              {WEEK_DAYS.map(day => {
                const active = hasCell(row.key, day.date)
                const isWeekend = WEEKEND.has(day.date)
                const stripePattern = 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 2px, transparent 2px, transparent 6px)'
                const calloutPattern = 'repeating-linear-gradient(-45deg, rgba(217,119,6,0.07) 0px, rgba(217,119,6,0.07) 2px, transparent 2px, transparent 6px)'
                return (
                  <div key={day.date} style={{
                    height: '28px',
                    borderRadius: '4px',
                    border: `1px ${row.border}`,
                    background: isWeekend
                      ? stripePattern
                      : active
                      ? (row.striped ? calloutPattern : row.bg)
                      : 'rgba(0,0,0,0.02)',
                  }} />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', overflowX: 'auto', flexWrap: 'nowrap' }}>
          {ROW_DEFS.map(row => (
            <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: row.accent, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', color: '#6b7280' }}>{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
