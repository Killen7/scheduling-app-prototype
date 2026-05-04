'use client'

import { useMemo } from 'react'
import type { PersonData } from '../LightshotBar'

const AVAIL_COLOR = { available: '#059669', partial: '#d97706', busy: '#dc2626' }
const AVAIL_LABEL = { available: 'Available', partial: 'Partial', busy: 'Busy' }

interface PeoplePanelProps {
  query: string
  people: PersonData[]
  onHoverPerson: (person: PersonData | null) => void
  onCancelHover: () => void
}

export function PeoplePanel({ query, people, onHoverPerson, onCancelHover }: PeoplePanelProps) {
  const filtered = useMemo(() => {
    if (!query) return people
    const q = query.toLowerCase()
    return people.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    )
  }, [query, people])

  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase', padding: '10px 16px 4px' }}>
        People ({filtered.length})
      </div>

      {filtered.map(person => {
        const color = AVAIL_COLOR[person.availability]
        return (
          <div
            key={person.name}
            onMouseEnter={() => onHoverPerson(person)}
            onMouseLeave={() => { onHoverPerson(null); onCancelHover() }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'background 0.1s, border-color 0.1s' }}
            onMouseOver={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.background = 'rgba(0,0,0,0.04)'
              el.style.borderLeftColor = '#3d52a0'
            }}
            onMouseOut={e => {
              const el = e.currentTarget as HTMLDivElement
              el.style.background = 'transparent'
              el.style.borderLeftColor = 'transparent'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color, flexShrink: 0 }}>
              {person.name.split(',')[0].slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1f36' }}>{person.name}</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>{person.title} · {person.location}</div>
            </div>
            <span style={{ fontSize: '10px', borderRadius: '20px', padding: '2px 7px', background: `${color}18`, color, border: `1px solid ${color}30`, flexShrink: 0 }}>
              {AVAIL_LABEL[person.availability]}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', padding: '2px 6px', flexShrink: 0, minWidth: '34px', textAlign: 'center' }}>
              {person.weeklyHours}h
            </span>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
          No people match &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
