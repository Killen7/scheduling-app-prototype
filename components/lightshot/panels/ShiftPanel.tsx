'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { LOCATIONS, addStaffMember } from '@/lib/storage'
import type { StaffMember } from '@/lib/storage'
import type { PersonData } from '../LightshotBar'

const WEEK_DATES = [
  { label: 'Mon 5/4', value: '2026-05-04' },
  { label: 'Tue 5/5', value: '2026-05-05' },
  { label: 'Wed 5/6', value: '2026-05-06' },
  { label: 'Thu 5/7', value: '2026-05-07' },
  { label: 'Fri 5/8', value: '2026-05-08' },
]

const STEP_LABELS = ['Select Office', 'Date & Time', 'Assign Person']

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const period = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 || 12
  return `${display}:${m} ${period}`
}

interface ShiftPanelProps {
  staff: StaffMember[]
  people: PersonData[]
  onClose: () => void
}

export function ShiftPanel({ staff, people, onClose }: ShiftPanelProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [office, setOffice] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('16:00')
  const [person, setPerson] = useState<PersonData | null>(null)

  const canAdvance = step === 0 ? !!office : step === 1 ? !!date : !!person

  const next = () => step < 2 && setStep(s => (s + 1) as 1 | 2)
  const back = () => step > 0 && setStep(s => (s - 1) as 0 | 1)

  const submit = () => {
    if (!office || !date || !person) return
    addStaffMember({
      name: person.name,
      title: person.title,
      type: person.type,
      schedule: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      location: office,
      date,
    })
    onClose()
  }

  const peopleWithConflict = people.map(p => ({
    ...p,
    conflict: staff.some(m => m.name === p.name && m.date === date),
  }))

  const availColor = { available: '#059669', partial: '#d97706', busy: '#dc2626' }

  const pillBtn = (label: string, selected: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: '7px',
        border: '1px solid',
        fontSize: '13px',
        cursor: 'pointer',
        ...(selected
          ? { background: 'rgba(61,82,160,0.1)', borderColor: 'rgba(61,82,160,0.4)', color: '#1a1f36', fontWeight: 600 }
          : { background: 'transparent', borderColor: 'rgba(0,0,0,0.1)', color: '#6b7280' }),
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ padding: '16px' }}>
      {/* Step bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < step ? '#3d52a0' : i === step ? 'rgba(61,82,160,0.4)' : 'rgba(0,0,0,0.08)' }} />
        ))}
      </div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Step {step + 1} — {STEP_LABELS[step]}
      </div>

      {/* Step 0: Office */}
      {step === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {LOCATIONS.map(loc => pillBtn(loc.name, office === loc.name, () => setOffice(loc.name)))}
        </div>
      )}

      {/* Step 1: Date + Time */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Date</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {WEEK_DATES.map(d => pillBtn(d.label, date === d.value, () => setDate(d.value)))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            {[
              { label: 'Start', value: startTime, onChange: setStartTime },
              { label: 'End', value: endTime, onChange: setEndTime },
            ].map(({ label, value, onChange }, i) => (
              <div key={label} style={{ flex: 1 }}>
                {i === 0 || <div style={{ color: '#6b7280', marginBottom: '4px', fontSize: '11px' }}>&nbsp;</div>}
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
                <input
                  type="time"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', fontSize: '13px', color: '#1a1f36', outline: 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Assign person */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '240px', overflowY: 'auto' }}>
          {peopleWithConflict.map(p => {
            const isSelected = person?.name === p.name
            const color = availColor[p.availability]
            return (
              <button
                key={p.name}
                disabled={p.conflict}
                onClick={() => !p.conflict && setPerson(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: p.conflict ? 'not-allowed' : 'pointer',
                  opacity: p.conflict ? 0.45 : 1,
                  background: isSelected ? 'rgba(61,82,160,0.08)' : 'transparent',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${color}22`, border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color, flexShrink: 0 }}>
                  {p.name.split(',')[0].slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1f36' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{p.title}</div>
                </div>
                {p.conflict ? (
                  <span style={{ fontSize: '10px', borderRadius: '20px', padding: '2px 7px', background: 'rgba(220,38,38,0.07)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', flexShrink: 0 }}>
                    Conflict
                  </span>
                ) : (
                  <span style={{ fontSize: '10px', borderRadius: '20px', padding: '2px 7px', background: `${color}15`, color, border: `1px solid ${color}30`, flexShrink: 0 }}>
                    {p.availability === 'available' ? 'OK' : 'Partial'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        {step > 0 && (
          <button
            onClick={back}
            style={{ padding: '8px 14px', borderRadius: '9px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)', fontSize: '13px', fontWeight: 500, color: '#1a1f36', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}
        <button
          disabled={!canAdvance}
          onClick={step < 2 ? next : submit}
          style={{ flex: 1, padding: '9px 16px', borderRadius: '9px', border: 'none', background: canAdvance ? '#3d52a0' : 'rgba(0,0,0,0.06)', color: canAdvance ? 'white' : '#9ca3af', fontSize: '13px', fontWeight: 600, cursor: canAdvance ? 'pointer' : 'not-allowed' }}
        >
          {step === 2 ? 'Create Shift' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
