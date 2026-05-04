'use client'

import { X } from 'lucide-react'
import { parseScheduleToMinutes } from '@/lib/schedule-utils'
import type { StaffMember } from '@/lib/storage'

const START_HOUR = 6
const END_HOUR = 20
const TOTAL_HOURS = END_HOUR - START_HOUR
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i)

const SECTION_ORDER: StaffMember['type'][] = ['provider', 'clinical', 'non-clinical']
const SECTION_LABEL: Record<StaffMember['type'], string> = {
  provider: 'PROVIDERS',
  clinical: 'CLINICAL STAFF',
  'non-clinical': 'NON-CLINICAL STAFF',
}
const BAR_BG: Record<StaffMember['type'], string> = {
  provider: 'rgba(110,142,251,0.25)',
  clinical: 'rgba(110,142,251,0.25)',
  'non-clinical': 'rgba(52,211,153,0.2)',
}
const BAR_BORDER: Record<StaffMember['type'], string> = {
  provider: 'rgba(110,142,251,0.45)',
  clinical: 'rgba(110,142,251,0.45)',
  'non-clinical': 'rgba(52,211,153,0.35)',
}

function formatHourShort(h: number) {
  if (h === 12) return '12p'
  if (h === 0)  return '12a'
  return h < 12 ? `${h}a` : `${h - 12}p`
}

interface OfficePeekProps {
  officeName: string
  staff: StaffMember[]
  today: string
  onDismiss: () => void
}

export function OfficePeek({ officeName, staff, today, onDismiss }: OfficePeekProps) {
  const todayStaff = staff.filter(m => m.location === officeName && m.date === today)

  const grouped: Record<StaffMember['type'], StaffMember[]> = { provider: [], clinical: [], 'non-clinical': [] }
  const seen = new Set<string>()
  for (const m of todayStaff) {
    const key = `${m.name}::${m.type}`
    if (!seen.has(key)) { seen.add(key); grouped[m.type].push(m) }
  }

  const barStyle = (schedule: string, type: StaffMember['type']): React.CSSProperties => {
    const { startMinutes, durationMinutes } = parseScheduleToMinutes(schedule)
    const startHour = startMinutes / 60
    const leftPct = Math.max(0, ((startHour - START_HOUR) / TOTAL_HOURS) * 100)
    const widthPct = Math.min((durationMinutes / 60 / TOTAL_HOURS) * 100, 100 - leftPct)
    return { position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`, top: '5px', bottom: '5px', borderRadius: '4px', border: `1px solid ${BAR_BORDER[type]}`, background: BAR_BG[type] }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#ffffff', zIndex: 10, borderRadius: '16px', overflow: 'hidden', animation: 'ls-peek-in 0.2s cubic-bezier(0.34,1.2,0.64,1)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>
          🏥
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1f36' }}>{officeName}</div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>Today · {todayStaff.length} staff</div>
        </div>
        <button
          onClick={onDismiss}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', fontSize: '10px', color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <X size={10} /> ESC to close
        </button>
      </div>

      {/* Gantt */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Time ruler */}
        <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2, borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', paddingLeft: '110px' }}>
          <div style={{ position: 'relative', flex: 1, height: '22px' }}>
            {HOURS.map(h => (
              <span key={h} style={{ position: 'absolute', left: `${((h - START_HOUR) / TOTAL_HOURS) * 100}%`, transform: 'translateX(-50%)', fontSize: '9px', color: '#6b7280', top: '5px', userSelect: 'none', whiteSpace: 'nowrap' }}>
                {formatHourShort(h)}
              </span>
            ))}
          </div>
        </div>

        {SECTION_ORDER.map(type => {
          const rows = grouped[type]
          if (rows.length === 0) return null
          return (
            <div key={type}>
              <div style={{ padding: '5px 16px', background: 'rgba(0,0,0,0.025)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.07em', color: '#6b7280', textTransform: 'uppercase' }}>
                  {SECTION_LABEL[type]}
                </span>
              </div>
              {rows.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.04)', minHeight: '34px' }}>
                  <div style={{ width: '110px', flexShrink: 0, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(61,82,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 700, color: '#3d52a0', flexShrink: 0 }}>
                      {member.name.split(',')[0].slice(0, 1).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '10px', fontWeight: 500, color: '#1a1f36', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70px' }}>
                        {member.name.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '9px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70px' }}>
                        {member.title.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, position: 'relative', height: '34px' }}>
                    {HOURS.map(h => (
                      <div key={h} style={{ position: 'absolute', left: `${((h - START_HOUR) / TOTAL_HOURS) * 100}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.04)' }} />
                    ))}
                    <div style={barStyle(member.schedule, member.type)} />
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {todayStaff.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
            No staff scheduled today for this office.
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ padding: '6px 16px', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '12px', flexShrink: 0 }}>
        {[
          { label: 'Shift', color: 'rgba(110,142,251,0.45)' },
          { label: 'Alt shift', color: 'rgba(52,211,153,0.5)' },
          { label: 'Unavailable', color: 'rgba(0,0,0,0.08)' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
            <span style={{ fontSize: '10px', color: '#6b7280' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
