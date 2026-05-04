'use client'

import { useEffect, useRef, useState, type Dispatch, type KeyboardEvent as ReactKeyboardEvent, type RefObject, type SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import { Search, Plus } from 'lucide-react'

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

type TokenKey = 'name' | 'day' | 'startHour' | 'endHour'

const CREATE_SHIFT_TEMPLATE = 'Create a shift for  on  from  to '
const TOKEN_INPUT_BASE_STYLE = {
  border: '1px solid transparent',
  borderRadius: '6px',
  padding: '0 4px',
  height: '28px',
  boxSizing: 'border-box' as const,
  fontSize: '14px',
  lineHeight: '28px',
  color: '#1a1f36',
  outline: 'none',
  flex: '0 0 auto' as const,
  background: '#f5f5f5',
}

export function LightshotBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [templateActive, setTemplateActive] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [dayValue, setDayValue] = useState('')
  const [startHourValue, setStartHourValue] = useState('')
  const [endHourValue, setEndHourValue] = useState('')
  const [activeToken, setActiveToken] = useState<TokenKey | null>(null)
  const mainInputRef = useRef<HTMLInputElement>(null)
  const templateLineRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const dayInputRef = useRef<HTMLInputElement>(null)
  const startHourInputRef = useRef<HTMLInputElement>(null)
  const endHourInputRef = useRef<HTMLInputElement>(null)
  const tokenMeasureContextRef = useRef<CanvasRenderingContext2D | null>(null)
  const normalizedQuery = query.trim().toLowerCase()
  const shouldShowCreateShift = normalizedQuery.startsWith('c') && !templateActive
  const getTokenWidth = (value: string, placeholder: string) => {
    const text = value || placeholder
    if (typeof window === 'undefined') return `${Math.max(text.length, 1)}ch`

    if (!tokenMeasureContextRef.current) {
      const canvas = document.createElement('canvas')
      tokenMeasureContextRef.current = canvas.getContext('2d')
    }

    const context = tokenMeasureContextRef.current
    if (!context) return `${Math.max(text.length, 1)}ch`

    context.font = '14px Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
    const measuredTextWidth = context.measureText(text).width
    return `${Math.ceil(measuredTextWidth) + 12}px`
  }

  const activateCreateShiftTemplate = () => {
    setTemplateActive(true)
    setActiveToken('name')
    setQuery(CREATE_SHIFT_TEMPLATE)
    window.requestAnimationFrame(() => {
      const input = nameInputRef.current
      if (!input) return
      input.focus()
      input.setSelectionRange(0, input.value.length)
    })
  }

  const tokenRefs: Record<TokenKey, RefObject<HTMLInputElement | null>> = {
    name: nameInputRef,
    day: dayInputRef,
    startHour: startHourInputRef,
    endHour: endHourInputRef,
  }

  const tokenOrder: TokenKey[] = ['name', 'day', 'startHour', 'endHour']

  const focusToken = (token: TokenKey, selectAll = false) => {
    window.requestAnimationFrame(() => {
      const input = tokenRefs[token].current
      if (!input) return
      input.focus()
      if (selectAll) {
        input.setSelectionRange(0, input.value.length)
      } else {
        const length = input.value.length
        input.setSelectionRange(length, length)
      }
      input.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      templateLineRef.current?.scrollTo({
        left: input.offsetLeft - 90,
        behavior: 'smooth',
      })
    })
  }

  const getSiblingToken = (token: TokenKey, direction: -1 | 1) => {
    const index = tokenOrder.indexOf(token)
    const sibling = tokenOrder[index + direction]
    return sibling ?? null
  }

  const handleTokenBackspace = (
    event: ReactKeyboardEvent<HTMLInputElement>,
    value: string,
    previous?: {
      token: TokenKey
      setValue: Dispatch<SetStateAction<string>>
    }
  ) => {
    if (event.key !== 'Backspace') return

    const selectionStart = event.currentTarget.selectionStart ?? 0
    const selectionEnd = event.currentTarget.selectionEnd ?? 0
    const hasSelection = selectionStart !== selectionEnd
    const isCaretAtStart = selectionStart === 0 && selectionEnd === 0

    // Keep native character-by-character deletion whenever possible.
    if (hasSelection || !isCaretAtStart) {
      return
    }

    if (!previous) return

    // When at the start of a token, backspace continues on previous token.
    event.preventDefault()
    previous.setValue((current) => current.slice(0, -1))
    setActiveToken(previous.token)
    focusToken(previous.token)
  }

  const handleTokenNavigation = (
    event: ReactKeyboardEvent<HTMLInputElement>,
    token: TokenKey,
    value: string,
    previous?: {
      token: TokenKey
      setValue: Dispatch<SetStateAction<string>>
    }
  ) => {
    if (event.key === 'Backspace') {
      handleTokenBackspace(event, value, previous)
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      const direction: -1 | 1 = event.shiftKey ? -1 : 1
      const siblingToken = getSiblingToken(token, direction)
      if (!siblingToken) return
      setActiveToken(siblingToken)
      focusToken(siblingToken, true)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const nextToken = getSiblingToken(token, 1)
      if (!nextToken) return
      setActiveToken(nextToken)
      focusToken(nextToken, true)
      return
    }

    if (event.key === 'ArrowLeft' && event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0) {
      const previousToken = getSiblingToken(token, -1)
      if (!previousToken) return
      event.preventDefault()
      setActiveToken(previousToken)
      focusToken(previousToken)
      return
    }

    const caretPosition = event.currentTarget.selectionStart ?? 0
    const valueLength = event.currentTarget.value.length
    if (event.key === 'ArrowRight' && caretPosition === valueLength) {
      const nextToken = getSiblingToken(token, 1)
      if (!nextToken) return
      event.preventDefault()
      setActiveToken(nextToken)
      focusToken(nextToken)
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setTemplateActive(false)
      setNameValue('')
      setDayValue('')
      setStartHourValue('')
      setEndHourValue('')
      setActiveToken(null)
    }
  }, [open])

  const barContent = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={() => setOpen(false)}
      />

      <div
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
          overflow: 'hidden',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <Search size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
          {templateActive ? (
            <div
              ref={templateLineRef}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                flexWrap: 'nowrap',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                scrollbarWidth: 'thin',
              }}
            >
              <span style={{ fontSize: '14px', color: '#1a1f36', flex: '0 0 auto' }}>Create a shift for </span>
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                onFocus={() => setActiveToken('name')}
                onClick={() => setActiveToken('name')}
                onKeyDown={(event) =>
                  handleTokenNavigation(event, 'name', nameValue)
                }
                placeholder="Name"
                style={{
                  ...TOKEN_INPUT_BASE_STYLE,
                  width: getTokenWidth(nameValue, 'Name'),
                  borderColor: activeToken === 'name' ? 'rgba(61,82,160,0.35)' : 'transparent',
                  boxShadow: activeToken === 'name' ? '0 0 0 2px rgba(61,82,160,0.12)' : 'none',
                }}
              />
              <span style={{ fontSize: '14px', color: '#1a1f36', flex: '0 0 auto' }}> on </span>
              <input
                ref={dayInputRef}
                value={dayValue}
                onChange={(event) => setDayValue(event.target.value)}
                onFocus={() => setActiveToken('day')}
                onClick={() => setActiveToken('day')}
                onKeyDown={(event) =>
                  handleTokenNavigation(event, 'day', dayValue, {
                    token: 'name',
                    setValue: setNameValue,
                  })
                }
                placeholder="Day"
                style={{
                  ...TOKEN_INPUT_BASE_STYLE,
                  width: getTokenWidth(dayValue, 'Day'),
                  borderColor: activeToken === 'day' ? 'rgba(61,82,160,0.35)' : 'transparent',
                  boxShadow: activeToken === 'day' ? '0 0 0 2px rgba(61,82,160,0.12)' : 'none',
                }}
              />
              <span style={{ fontSize: '14px', color: '#1a1f36', flex: '0 0 auto' }}> from </span>
              <input
                ref={startHourInputRef}
                value={startHourValue}
                onChange={(event) => setStartHourValue(event.target.value)}
                onFocus={() => setActiveToken('startHour')}
                onClick={() => setActiveToken('startHour')}
                onKeyDown={(event) =>
                  handleTokenNavigation(event, 'startHour', startHourValue, {
                    token: 'day',
                    setValue: setDayValue,
                  })
                }
                placeholder="Start hour"
                style={{
                  ...TOKEN_INPUT_BASE_STYLE,
                  width: getTokenWidth(startHourValue, 'Start hour'),
                  borderColor: activeToken === 'startHour' ? 'rgba(61,82,160,0.35)' : 'transparent',
                  boxShadow: activeToken === 'startHour' ? '0 0 0 2px rgba(61,82,160,0.12)' : 'none',
                }}
              />
              <span style={{ fontSize: '14px', color: '#1a1f36', flex: '0 0 auto' }}> to </span>
              <input
                ref={endHourInputRef}
                value={endHourValue}
                onChange={(event) => setEndHourValue(event.target.value)}
                onFocus={() => setActiveToken('endHour')}
                onClick={() => setActiveToken('endHour')}
                onKeyDown={(event) =>
                  handleTokenNavigation(event, 'endHour', endHourValue, {
                    token: 'startHour',
                    setValue: setStartHourValue,
                  })
                }
                placeholder="End hour"
                style={{
                  ...TOKEN_INPUT_BASE_STYLE,
                  width: getTokenWidth(endHourValue, 'End hour'),
                  borderColor: activeToken === 'endHour' ? 'rgba(61,82,160,0.35)' : 'transparent',
                  boxShadow: activeToken === 'endHour' ? '0 0 0 2px rgba(61,82,160,0.12)' : 'none',
                }}
              />
            </div>
          ) : (
            <input
              ref={mainInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && shouldShowCreateShift) {
                  event.preventDefault()
                  activateCreateShiftTemplate()
                }
              }}
              placeholder="Search..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#1a1f36', background: 'transparent', caretColor: '#3d52a0' }}
            />
          )}
          <kbd
            onClick={() => setOpen(false)}
            style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '5px', padding: '2px 6px', fontSize: '11px', color: '#6b7280', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            ESC
          </kbd>
        </div>

        {shouldShowCreateShift && (
          <div style={{ padding: '10px 14px' }}>
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.09)',
                background: 'rgba(0,0,0,0.02)',
                color: '#1a1f36',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onClick={activateCreateShiftTemplate}
            >
              <Plus size={14} style={{ color: '#3d52a0' }} />
              Create Shift
            </button>
          </div>
        )}
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
    </>
  )
}
