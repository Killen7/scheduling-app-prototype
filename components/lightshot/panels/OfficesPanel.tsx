'use client'

import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import { LOCATIONS } from '@/lib/storage'
import type { StaffMember } from '@/lib/storage'

interface OfficesPanelProps {
  staff: StaffMember[]
  today: string
  onHoverOffice: (office: string | null) => void
  onCancelHover: () => void
}

export function OfficesPanel({ staff, today, onHoverOffice, onCancelHover }: OfficesPanelProps) {
  const offices = useMemo(() => {
    return LOCATIONS.map(loc => {
      const locStaff = staff.filter(m => m.location === loc.name)
      const todayStaff = locStaff.filter(m => m.date === today)

      const staffed = new Set(todayStaff.map(m => m.name)).size
      const shifts = todayStaff.length

      // Provider balance: providers working today vs total unique providers at this office
      const totalProviders = new Set(locStaff.filter(m => m.type === 'provider').map(m => m.name)).size
      const todayProviders = new Set(todayStaff.filter(m => m.type === 'provider').map(m => m.name)).size
      const providerBalance = todayProviders - totalProviders

      // Support balance: clinical + non-clinical today vs total unique support at this office
      const totalSupport = new Set(locStaff.filter(m => m.type !== 'provider').map(m => m.name)).size
      const todaySupport = new Set(todayStaff.filter(m => m.type !== 'provider').map(m => m.name)).size
      const supportBalance = todaySupport - totalSupport

      return { ...loc, staffed, shifts, providerBalance, supportBalance }
    })
  }, [staff, today])

  const fmt = (n: number) => n > 0 ? `+${n}` : `${n}`

  const balanceBox = (n: number) => (
    <div style={{
      minWidth: '34px',
      height: '28px',
      borderRadius: '6px',
      background: 'rgba(220,38,38,0.08)',
      border: '1px solid rgba(220,38,38,0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 700,
      color: '#dc2626',
      padding: '0 6px',
      flexShrink: 0,
      letterSpacing: '-0.3px',
    }}>
      {fmt(n)}
    </div>
  )

  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase', padding: '10px 16px 4px' }}>
        Offices
      </div>

      {offices.map(office => (
        <div
          key={office.id}
          onMouseEnter={() => onHoverOffice(office.name)}
          onMouseLeave={() => { onHoverOffice(null); onCancelHover() }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'background 0.1s, border-color 0.1s' }}
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
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={16} style={{ color: '#d97706' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1f36', marginBottom: '2px' }}>{office.name}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {office.staffed} staffed · {office.shifts} shifts today
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {balanceBox(office.providerBalance)}
            {balanceBox(office.supportBalance)}
          </div>
        </div>
      ))}
    </div>
  )
}
