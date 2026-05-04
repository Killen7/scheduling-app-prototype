'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Building2, CalendarIcon, Search, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatHour, getDailyHours, parseScheduleToMinutes } from '@/lib/schedule-utils'
import type { Recommendation, StaffMember } from '@/lib/storage'
import { LOCATIONS, loadRecommendations, loadStaff } from '@/lib/storage'

const PREVIEW_HOUR_WIDTH = 60
const PREVIEW_ROW_HEIGHT = 60
const PREVIEW_PILL_HEIGHT = 50

function getPillColor(type: StaffMember['type'] | 'recommendation') {
  if (type === 'provider') return 'bg-[#ebeef0] text-gray-900'
  if (type === 'recommendation') return 'bg-red-100 text-red-800 border border-red-200'
  return 'bg-[#ddebff] text-[#1f3b6b]'
}

function getPreviewPillStyle(schedule: string): { left: number; width: number } {
  const { startMinutes, durationMinutes } = parseScheduleToMinutes(schedule)
  return {
    left: (startMinutes / 60) * PREVIEW_HOUR_WIDTH,
    width: Math.max((durationMinutes / 60) * PREVIEW_HOUR_WIDTH, PREVIEW_HOUR_WIDTH / 2),
  }
}

function getTopPeople() {
  const staff = loadStaff()
  const uniqueNames = new Set<string>()
  const people: string[] = []

  for (const member of staff) {
    if (uniqueNames.has(member.name)) continue
    uniqueNames.add(member.name)
    people.push(member.name)
    if (people.length === 3) break
  }

  return people
}

function formatDateLabel(value: string) {
  const [year, month, day] = value.split('-')
  const date = new Date(`${value}T00:00:00`)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${days[date.getDay()]} ${month}/${day}/${year}`
}

function buildOfficePreviewRows(staff: StaffMember[], office: string, date: string) {
  const grouped = new Map<string, StaffMember>()
  const filtered = staff.filter((member) => member.location === office && member.date === date)

  for (const member of filtered) {
    const key = `${member.name}::${member.title}::${member.type}`
    if (!grouped.has(key)) grouped.set(key, member)
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function getOfficeDates(staff: StaffMember[], recommendations: Recommendation[], office: string) {
  const dates = [
    ...staff.filter((member) => member.location === office).map((member) => member.date),
    ...recommendations.filter((recommendation) => recommendation.location === office).map((recommendation) => recommendation.date),
  ]
  return Array.from(new Set(dates)).sort()
}

function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function MiniSchedulePreview({
  office,
  selectedDate,
  staff,
  recommendations,
}: {
  office: string
  selectedDate: string
  staff: StaffMember[]
  recommendations: Recommendation[]
}) {
  const rows = buildOfficePreviewRows(staff, office, selectedDate)
  const recommendationSlots = recommendations
    .filter((recommendation) => recommendation.location === office && recommendation.date === selectedDate)
    .flatMap((recommendation) => recommendation.slots)
  const hours = getDailyHours()
  const gridWidth = hours.length * PREVIEW_HOUR_WIDTH

  if (rows.length === 0 && recommendationSlots.length === 0) {
    return <p className="px-4 py-6 text-sm text-gray-500">No schedule data available for this office.</p>
  }

  return (
    <div className="max-h-[420px] overflow-auto">
      <div className="min-w-max">
        <div className="flex border-b border-gray-200">
          <div className="sticky left-0 z-10 flex w-48 shrink-0 items-center border-r border-gray-200 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            Person
          </div>
          <div className="flex" style={{ width: gridWidth }}>
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex items-center justify-center border-r border-gray-200 text-[10px] font-semibold text-gray-500"
                style={{ width: PREVIEW_HOUR_WIDTH, minWidth: PREVIEW_HOUR_WIDTH, height: 28 }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>
        </div>

        {recommendationSlots.length > 0 && (
          <div className="flex border-b border-gray-200">
            <div className="sticky left-0 z-10 flex w-48 shrink-0 items-center border-r border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900">
              Recommendations
            </div>
            <div className="relative" style={{ width: gridWidth, height: PREVIEW_ROW_HEIGHT }}>
              <div className="absolute inset-0 flex">
                {hours.map((hour) => (
                  <div key={`recommendation-${hour}`} className="h-full border-r border-gray-200" style={{ width: PREVIEW_HOUR_WIDTH, minWidth: PREVIEW_HOUR_WIDTH }} />
                ))}
              </div>
              {recommendationSlots.map((slot, index) => {
                const style = getPreviewPillStyle(slot)
                return (
                  <div
                    key={`${slot}-${index}`}
                    className={`absolute top-1/2 flex -translate-y-1/2 items-center overflow-hidden rounded-[8px] px-2 text-[10px] font-medium ${getPillColor('recommendation')}`}
                    style={{
                      left: style.left,
                      width: style.width,
                      height: PREVIEW_PILL_HEIGHT,
                      transform: `translateY(calc(-50% + ${index * 2}px))`,
                    }}
                  >
                    {slot}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {rows.map((row) => (
          <div key={row.id} className="flex border-b border-gray-200">
            <div className="sticky left-0 z-10 flex w-48 shrink-0 flex-col justify-center border-r border-gray-200 bg-white px-3 py-2">
              <p className="truncate text-xs font-medium text-gray-900">{row.name}</p>
              <p className="truncate text-[10px] text-gray-500">{row.title}</p>
            </div>
            <div className="relative" style={{ width: gridWidth, height: PREVIEW_ROW_HEIGHT }}>
              <div className="absolute inset-0 flex">
                {hours.map((hour) => (
                  <div key={`${row.id}-${hour}`} className="h-full border-r border-gray-200" style={{ width: PREVIEW_HOUR_WIDTH, minWidth: PREVIEW_HOUR_WIDTH }} />
                ))}
              </div>
              <div
                className={`absolute top-1/2 flex -translate-y-1/2 items-center overflow-hidden rounded-[8px] px-2 text-[10px] font-medium ${getPillColor(row.type)}`}
                style={{
                  ...getPreviewPillStyle(row.schedule),
                  height: PREVIEW_PILL_HEIGHT,
                }}
              >
                {row.schedule}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Spotlight() {
  const [open, setOpen] = useState(false)
  const [previewOffice, setPreviewOffice] = useState<string | null>(null)
  const [previewDate, setPreviewDate] = useState('')

  const offices = useMemo(() => LOCATIONS.slice(0, 3), [])
  const people = useMemo(() => getTopPeople(), [])
  const staff = useMemo(() => loadStaff(), [])
  const recommendations = useMemo(() => loadRecommendations(), [])

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
    if (!open) setPreviewOffice(null)
  }, [open])

  useEffect(() => {
    if (!previewOffice) {
      setPreviewDate('')
      return
    }

    const availableDates = getOfficeDates(staff, recommendations, previewOffice)
    const todayDate = getTodayDate()

    if (availableDates.includes(todayDate)) {
      setPreviewDate(todayDate)
      return
    }

    setPreviewDate(availableDates[0] ?? '')
  }, [previewOffice, staff, recommendations])

  return (
    <>
      <Button
        variant="outline"
        className="h-9 gap-2 border-gray-300 text-neutral-700"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Spotlight
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        modal={false}
        title="Spotlight"
        description="Quick access to offices and people."
        className="max-w-[560px]"
      >
        <CommandInput placeholder="Search offices or people..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Offices">
            {offices.map((office) => (
              <CommandItem
                key={office.id}
                value={office.name}
                className="data-[selected=true]:bg-neutral-100 data-[selected=true]:text-neutral-900"
                onMouseEnter={() => setPreviewOffice(office.name)}
                onFocus={() => setPreviewOffice(office.name)}
              >
                <Building2 className="size-4" />
                <span>{office.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="People">
            {people.map((person) => (
              <CommandItem
                key={person}
                value={person}
                className="data-[selected=true]:bg-neutral-100 data-[selected=true]:text-neutral-900"
              >
                <UserRound className="size-4" />
                <span>{person}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {typeof window !== 'undefined' &&
        open &&
        previewOffice &&
        createPortal(
          <div className="fixed inset-0 z-80 flex items-center justify-center p-6 pointer-events-none">
            <div className="pointer-events-auto w-[90vw] max-w-[1120px] overflow-hidden rounded-lg border bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="text-sm font-semibold text-neutral-900">{previewOffice}</p>
                <div className="w-[210px]">
                  <Select value={previewDate} onValueChange={setPreviewDate}>
                    <SelectTrigger className="h-9 w-full rounded-lg border border-gray-300">
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <SelectValue placeholder="Select date" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOfficeDates(staff, recommendations, previewOffice).map((date) => (
                        <SelectItem key={date} value={date}>
                          {formatDateLabel(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="max-h-[80vh] overflow-y-auto">
                {previewDate ? (
                  <MiniSchedulePreview
                    office={previewOffice}
                    selectedDate={previewDate}
                    staff={staff}
                    recommendations={recommendations}
                  />
                ) : (
                  <p className="px-4 py-6 text-sm text-gray-500">No available dates for this office.</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
