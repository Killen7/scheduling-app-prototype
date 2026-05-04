'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, Plus, Users, Building2, Sparkles, Clock } from 'lucide-react'
import { LOCATIONS, loadStaff } from '@/lib/storage'
import type { StaffMember } from '@/lib/storage'
import { parseScheduleToMinutes } from '@/lib/schedule-utils'
import { ShiftPanel } from './panels/ShiftPanel'
import { PeoplePanel } from './panels/PeoplePanel'
import { OfficesPanel } from './panels/OfficesPanel'
import { AIPanel } from './panels/AIPanel'
import { PersonPeek } from './peeks/PersonPeek'
import { OfficePeek } from './peeks/OfficePeek'

export type PanelType = 'shift' | 'people' | 'offices' | 'ai' | null

export interface PersonData {
  name: string
  title: string
  type: 'provider' | 'non-clinical' | 'clinical'
  location: string
  availability: 'available' | 'partial' | 'busy'
  todaySchedule: string | null
  weeklyHours: number
}

export const TODAY = '2026-05-04'

export function derivePersonData(staff: StaffMember[], today = TODAY): PersonData[] {
  const seen = new Set<string>()
  const names: string[] = []

  for (const m of staff) {
    if (!seen.has(m.name)) {
      seen.add(m.name)
      names.push(m.name)
    }
  }

  return names.map(name => {
    const entries = staff.filter(m => m.name === name)
    const first = entries[0]
    const todayEntry = entries.find(m => m.date === today)

    let availability: PersonData['availability']
    let todaySchedule: string | null = null

    if (todayEntry) {
      todaySchedule = todayEntry.schedule
      const { durationMinutes } = parseScheduleToMinutes(todayEntry.schedule)
      availability = durationMinutes >= 360 ? 'busy' : 'partial'
    } else {
      availability = 'available'
    }

    const weeklyHours = Math.round(
      entries.reduce((sum, m) => sum + parseScheduleToMinutes(m.schedule).durationMinutes, 0) / 60
    )

    return { name, title: first.title, type: first.type, location: first.location, availability, todaySchedule, weeklyHours }
  })
}

const RECENT_ITEMS = [
  { type: 'person' as const, label: 'Martinez, Sofia', sub: 'Physician Assistant · 1st Floor' },
  { type: 'office' as const, label: '2nd Floor', sub: '12 staff scheduled today' },
  { type: 'shift' as const, label: 'Create Shift — 3rd Floor', sub: 'Mon May 4, 8:00 AM – 4:00 PM' },
]

const GLOBAL_STYLES = `
  @keyframes ls-enter {
    from { opacity: 0; transform: translateX(-50%) scale(0.96) translateY(-8px); }
    to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
  }
  @keyframes ls-peek-in {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes ls-dot {
    0%, 60%, 100% { transform: scale(1); opacity: 0.3; }
    30% { transform: scale(1.4); opacity: 1; }
  }
`

export function LightshotBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activePanel, setActivePanel] = useState<PanelType>(null)
  const [hoveredPerson, setHoveredPerson] = useState<PersonData | null>(null)
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null)
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const staff = useMemo(() => loadStaff(), [])
  const people = useMemo(() => derivePersonData(staff), [staff])

  const activePeek = hoveredPerson ? 'person' : hoveredOffice ? 'office' : null

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActivePanel(null)
    setHoveredPerson(null)
    setHoveredOffice(null)
  }, [])

  const dismissPeek = useCallback(() => {
    setHoveredPerson(null)
    setHoveredOffice(null)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        open ? close() : setOpen(true)
        return
      }
      if (!open) return
      if (e.key === 'Escape') {
        activePeek ? dismissPeek() : close()
        return
      }
      if (activePeek && !e.metaKey && !e.ctrlKey && !e.altKey) dismissPeek()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, activePeek, close, dismissPeek])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (query.length > 3 && activePanel === null) setActivePanel('ai')
    else if (query.length === 0 && activePanel === 'ai') setActivePanel(null)
  }, [query, activePanel])

  const scheduleHoverPerson = useCallback((person: PersonData | null) => {
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current)
    if (!person) return
    peekTimerRef.current = setTimeout(() => {
      setHoveredPerson(person)
      setHoveredOffice(null)
    }, 320)
  }, [])

  const scheduleHoverOffice = useCallback((office: string | null) => {
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current)
    if (!office) return
    peekTimerRef.current = setTimeout(() => {
      setHoveredOffice(office)
      setHoveredPerson(null)
    }, 320)
  }, [])

  const cancelHover = useCallback(() => {
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current)
  }, [])

  const quickPicks = [
    { id: 'shift' as const, label: 'Create Shift', Icon: Plus, filled: true },
    { id: 'people' as const, label: 'People', Icon: Users, color: '#059669' },
    { id: 'offices' as const, label: 'Offices', Icon: Building2, color: '#d97706' },
    { id: 'ai' as const, label: 'Ask AI', Icon: Sparkles, color: '#6d5bc8' },
  ]

  const barContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={close}
      />

      {/* Container */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '620px',
          maxWidth: 'calc(100vw - 32px)',
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.09)',
          borderRadius: '16px',
          boxShadow: '0 0 0 1px rgba(61,82,160,0.06), 0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.08)',
          animation: 'ls-enter 0.2s cubic-bezier(0.34,1.2,0.64,1)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <Search size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or ask anything…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#1a1f36', background: 'transparent', caretColor: '#3d52a0' }}
          />
          <kbd
            onClick={close}
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '5px', padding: '2px 6px', fontSize: '11px', color: '#6b7280', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            ESC
          </kbd>
        </div>

        {/* Quick picks row */}
        <div style={{ display: 'flex', gap: '6px', padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexWrap: 'wrap' }}>
          {quickPicks.map(({ id, label, Icon, filled, color }) => {
            const isActive = activePanel === id
            return (
              <button
                key={id}
                onClick={() => { setActivePanel(isActive ? null : id); dismissPeek() }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  ...(filled
                    ? { background: isActive ? '#2d3f7c' : '#3d52a0', color: 'white', borderColor: '#3d52a0' }
                    : isActive
                    ? { background: 'rgba(61,82,160,0.12)', color: '#3d52a0', borderColor: 'rgba(61,82,160,0.35)' }
                    : { background: 'rgba(0,0,0,0.03)', color: '#1a1f36', borderColor: 'rgba(0,0,0,0.09)' }),
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '4px', background: filled ? 'rgba(255,255,255,0.18)' : 'transparent' }}>
                  <Icon size={12} style={{ color: filled ? 'white' : isActive ? '#3d52a0' : (color ?? '#6b7280') }} />
                </span>
                {label}
              </button>
            )
          })}
        </div>

        {/* Results area */}
        <div onScroll={() => activePeek && dismissPeek()} style={{ maxHeight: '480px', minHeight: activePanel !== null ? '480px' : undefined, overflowY: 'auto' }}>
          {/* Idle state */}
          {activePanel === null && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase', padding: '10px 16px 4px' }}>
                Recent
              </div>
              {RECENT_ITEMS.map((item, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', borderLeft: '2px solid transparent', transition: 'background 0.1s' }}
                  onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.cssText += ';background:rgba(0,0,0,0.04);border-left-color:#3d52a0' }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.cssText += ';background:transparent;border-left-color:transparent' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,0,0,0.04)', flexShrink: 0 }}>
                    {item.type === 'person' && <Users size={13} style={{ color: '#6b7280' }} />}
                    {item.type === 'office' && <Building2 size={13} style={{ color: '#6b7280' }} />}
                    {item.type === 'shift' && <Clock size={13} style={{ color: '#6b7280' }} />}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1f36' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activePanel === 'shift' && (
            <ShiftPanel staff={staff} people={people} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'people' && (
            <PeoplePanel query={query} people={people} onHoverPerson={scheduleHoverPerson} onCancelHover={cancelHover} />
          )}
          {activePanel === 'offices' && (
            <OfficesPanel staff={staff} today={TODAY} onHoverOffice={scheduleHoverOffice} onCancelHover={cancelHover} />
          )}
          {activePanel === 'ai' && (
            <AIPanel query={query} onAction={action => setActivePanel(action)} />
          )}

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[['↑↓', 'Navigate'], ['↵', 'Select'], ['ESC', 'Close']].map(([key, lbl]) => (
              <span key={lbl} style={{ fontSize: '10px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <kbd style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1px 4px', fontFamily: 'inherit' }}>{key}</kbd>
                {lbl}
              </span>
            ))}
          </div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', letterSpacing: '0.05em' }}>LIGHTSHOT</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#1a1f36', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.09)', cursor: 'pointer' }}
      >
        <Search size={14} style={{ color: '#6b7280' }} />
        <span>Search</span>
        <kbd style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px', color: '#6b7280', fontFamily: 'inherit' }}>⌘K</kbd>
      </button>

      {typeof window !== 'undefined' && open && createPortal(barContent, document.body)}

      {typeof window !== 'undefined' && open && hoveredPerson && createPortal(
        <div style={{
          position: 'fixed',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '620px',
          maxWidth: 'calc(100vw - 32px)',
          height: containerRef.current?.offsetHeight ?? 'auto',
          zIndex: 10000,
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.09)',
          boxShadow: '0 0 0 1px rgba(61,82,160,0.06), 0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.08)',
        }}>
          <PersonPeek person={hoveredPerson} staff={staff} onDismiss={dismissPeek} />
        </div>,
        document.body
      )}

      {typeof window !== 'undefined' && open && hoveredOffice && createPortal(
        <div style={{
          position: 'fixed',
          top: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '620px',
          maxWidth: 'calc(100vw - 32px)',
          height: containerRef.current?.offsetHeight ?? 'auto',
          zIndex: 10000,
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.09)',
          boxShadow: '0 0 0 1px rgba(61,82,160,0.06), 0 8px 32px rgba(0,0,0,0.12), 0 32px 64px rgba(0,0,0,0.08)',
        }}>
          <OfficePeek officeName={hoveredOffice} staff={staff} today={TODAY} onDismiss={dismissPeek} />
        </div>,
        document.body
      )}
    </>
  )
}
