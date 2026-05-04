'use client'

import type { Recommendation, StaffMember } from '@/lib/storage'
import {
  formatDate,
  formatHour,
  getDailyHours,
  getDailyPillStyle,
  getMonthDates,
  getWeekDates,
  type ViewMode,
} from '@/lib/schedule-utils'

interface ScheduleGridProps {
  staff: StaffMember[]
  recommendations: Recommendation[]
  viewMode: ViewMode
  selectedDate: string
  onDeleteShift?: (shiftId: string) => void
}

interface ShiftCell {
  id: string
  schedule: string
}

interface StaffRow {
  id: string
  name: string
  title: string
  type: StaffMember['type']
  shiftsByDate: Map<string, ShiftCell>
}

const DAY_CELL_HEIGHT = 90
const DAY_HOUR_WIDTH = 90
const WEEK_CELL_WIDTH = 270
const WEEK_CELL_HEIGHT = 90
const MONTH_CELL_SIZE = 90
const PILL_HEIGHT = 74

function getPillColor(type: StaffMember['type'] | 'recommendation') {
  if (type === 'provider') return 'bg-[#ebeef0] text-gray-900'
  if (type === 'recommendation') return 'bg-red-100 text-red-800 border border-red-200'
  return 'bg-[#ddebff] text-[#1f3b6b]'
}

function buildStaffRows(staff: StaffMember[]): StaffRow[] {
  const grouped = new Map<string, StaffRow>()

  for (const member of staff) {
    const key = `${member.name}::${member.title}::${member.type}`
    const existing = grouped.get(key)

    if (existing) {
      existing.shiftsByDate.set(member.date, { id: member.id, schedule: member.schedule })
      continue
    }

    grouped.set(key, {
      id: key,
      name: member.name,
      title: member.title,
      type: member.type,
      shiftsByDate: new Map([[member.date, { id: member.id, schedule: member.schedule }]]),
    })
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function getRecommendationSlotsByDate(recommendations: Recommendation[]) {
  const byDate = new Map<string, { slot: string; need: string }[]>()

  for (const recommendation of recommendations) {
    const current = byDate.get(recommendation.date) ?? []
    const next = recommendation.slots.map((slot) => ({ slot, need: recommendation.need }))
    byDate.set(recommendation.date, [...current, ...next])
  }

  return byDate
}

export function ScheduleGrid({
  staff,
  recommendations,
  viewMode,
  selectedDate,
  onDeleteShift,
}: ScheduleGridProps) {
  const staffRows = buildStaffRows(staff)
  const recommendationsByDate = getRecommendationSlotsByDate(recommendations)
  const hasRecommendations = recommendationsByDate.size > 0
  const staffGroups: { key: StaffMember['type']; label: string; rows: StaffRow[] }[] = [
    { key: 'provider', label: 'Providers', rows: staffRows.filter((row) => row.type === 'provider') },
    { key: 'non-clinical', label: 'Non-Clinical Staff', rows: staffRows.filter((row) => row.type === 'non-clinical') },
    { key: 'clinical', label: 'Clinical Staff', rows: staffRows.filter((row) => row.type === 'clinical') },
  ]

  const columns =
    viewMode === 'day'
      ? getDailyHours().map((hour) => ({ key: String(hour), label: formatHour(hour) }))
      : viewMode === 'week'
        ? getWeekDates(selectedDate).map((date) => ({ key: date, label: formatDate(date, 'full') }))
        : getMonthDates(selectedDate.slice(0, 7)).map((date) => ({ key: date, label: String(Number(date.split('-')[2])) }))

  if (staffRows.length === 0 && !hasRecommendations) {
    return <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No shifts available for the selected filters.</div>
  }

  const timeGridWidth =
    viewMode === 'day'
      ? columns.length * DAY_HOUR_WIDTH
      : viewMode === 'week'
        ? columns.length * WEEK_CELL_WIDTH
        : columns.length * MONTH_CELL_SIZE
  const columnWidth = viewMode === 'day' ? DAY_HOUR_WIDTH : viewMode === 'week' ? WEEK_CELL_WIDTH : MONTH_CELL_SIZE

  const handleShiftContextMenu = (event: React.MouseEvent, shift: ShiftCell) => {
    event.preventDefault()
    if (!onDeleteShift) return

    const confirmed = window.confirm('Delete this shift?')
    if (confirmed) onDeleteShift(shift.id)
  }

  const renderStaffRow = (row: StaffRow) =>
    viewMode === 'day' ? (
      <div key={row.id} className="flex border-b border-gray-200">
        <div className="sticky left-0 z-10 flex w-64 shrink-0 flex-col justify-center border-r border-gray-200 bg-white px-4 py-3">
          <p className="truncate text-sm font-medium text-gray-900">{row.name}</p>
          <p className="truncate text-xs text-gray-500">{row.title}</p>
        </div>
        <div className="relative" style={{ width: timeGridWidth, height: DAY_CELL_HEIGHT }}>
          <div className="absolute inset-0 flex">
            {columns.map((column) => (
              <div key={`${row.id}-${column.key}`} className="h-full border-r border-gray-200" style={{ width: DAY_HOUR_WIDTH, minWidth: DAY_HOUR_WIDTH }} />
            ))}
          </div>
          {(() => {
            const shift = row.shiftsByDate.get(selectedDate)
            if (!shift) return null

            return (
              <div
                onContextMenu={(event) => handleShiftContextMenu(event, shift)}
                title="Right click to delete shift"
                className={`absolute top-1/2 flex -translate-y-1/2 cursor-context-menu items-center overflow-hidden rounded-[8px] px-2 text-xs font-medium ${getPillColor(row.type)}`}
                style={{
                  ...getDailyPillStyle(shift.schedule),
                  height: PILL_HEIGHT,
                }}
              >
                {shift.schedule}
              </div>
            )
          })()}
        </div>
      </div>
    ) : (
      <div key={row.id} className="flex border-b border-gray-200">
        <div className="sticky left-0 z-10 flex w-64 shrink-0 flex-col justify-center border-r border-gray-200 bg-white px-4 py-3">
          <p className="truncate text-sm font-medium text-gray-900">{row.name}</p>
          <p className="truncate text-xs text-gray-500">{row.title}</p>
        </div>
        <div className="flex" style={{ width: timeGridWidth }}>
          {columns.map((column) => {
            const shiftCell = row.shiftsByDate.get(column.key)
            const shift = shiftCell?.schedule
            const showPill = Boolean(shift)
            return (
              <div
                key={`${row.id}-${column.key}`}
                className="flex items-center justify-center border-r border-gray-200 p-2"
                style={{
                  width: columnWidth,
                  minWidth: columnWidth,
                  height: viewMode === 'week' ? WEEK_CELL_HEIGHT : MONTH_CELL_SIZE,
                }}
              >
                {showPill &&
                  (viewMode === 'week' ? (
                    <div
                      onContextMenu={(event) => shiftCell && handleShiftContextMenu(event, shiftCell)}
                      title="Right click to delete shift"
                      className={`w-full rounded-[8px] px-2 py-1 text-xs font-medium ${getPillColor(row.type)}`}
                      style={{ height: PILL_HEIGHT, cursor: shiftCell ? 'context-menu' : 'default' }}
                    >
                      {shift}
                    </div>
                  ) : (
                    <div
                      onContextMenu={(event) => shiftCell && handleShiftContextMenu(event, shiftCell)}
                      title="Right click to delete shift"
                      className={`w-full rounded-[8px] ${getPillColor(row.type).split(' ')[0]}`}
                      style={{ height: PILL_HEIGHT, cursor: shiftCell ? 'context-menu' : 'default' }}
                    />
                  ))}
              </div>
            )
          })}
        </div>
      </div>
    )

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="flex border-b border-gray-200">
            <div className="sticky left-0 z-10 flex w-64 shrink-0 items-center border-r border-gray-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
              Person
            </div>
            <div className="flex" style={{ width: timeGridWidth }}>
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center justify-center border-r border-gray-200 px-2 py-3 text-xs font-semibold text-gray-600"
                  style={{
                    width: viewMode === 'day' ? DAY_HOUR_WIDTH : viewMode === 'week' ? WEEK_CELL_WIDTH : MONTH_CELL_SIZE,
                    minWidth: viewMode === 'day' ? DAY_HOUR_WIDTH : viewMode === 'week' ? WEEK_CELL_WIDTH : MONTH_CELL_SIZE,
                  }}
                >
                  {column.label}
                </div>
              ))}
            </div>
          </div>

          {hasRecommendations && (
            <div className="flex border-b border-gray-200">
              <div className="sticky left-0 z-10 flex w-64 shrink-0 flex-col justify-center border-r border-gray-200 bg-white px-4 py-3">
                <p className="truncate text-sm font-medium text-gray-900">Clinical Staff Recommendations</p>
                <p className="truncate text-xs text-gray-500">Coverage suggestions</p>
              </div>

              {viewMode === 'day' ? (
                <div className="relative" style={{ width: timeGridWidth, height: DAY_CELL_HEIGHT }}>
                  <div className="absolute inset-0 flex">
                    {columns.map((column) => (
                      <div key={`recommendation-${column.key}`} className="h-full border-r border-gray-200" style={{ width: DAY_HOUR_WIDTH, minWidth: DAY_HOUR_WIDTH }} />
                    ))}
                  </div>

                  {(recommendationsByDate.get(selectedDate) ?? []).map((slot, index) => {
                    const style = getDailyPillStyle(slot.slot)
                    return (
                      <div
                        key={`${slot.slot}-${index}`}
                        className={`absolute top-2 flex items-center overflow-hidden rounded-[8px] px-2 text-xs font-medium ${getPillColor('recommendation')}`}
                        style={{
                          left: style.left,
                          width: style.width,
                          height: PILL_HEIGHT,
                          transform: `translateY(${index * 32}px)`,
                        }}
                      >
                        {slot.slot}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex" style={{ width: timeGridWidth }}>
                  {columns.map((column) => {
                    const slots = recommendationsByDate.get(column.key) ?? []
                    return (
                      <div
                        key={`recommendation-${column.key}`}
                        className="border-r border-gray-200 p-2"
                        style={{
                          width: viewMode === 'week' ? WEEK_CELL_WIDTH : MONTH_CELL_SIZE,
                          minWidth: viewMode === 'week' ? WEEK_CELL_WIDTH : MONTH_CELL_SIZE,
                          height: viewMode === 'week' ? WEEK_CELL_HEIGHT : MONTH_CELL_SIZE,
                        }}
                      >
                        {viewMode === 'week' ? (
                          <div className="flex h-full flex-col gap-1 overflow-hidden">
                            {slots.slice(0, 2).map((slot, index) => (
                              <div
                                key={`${slot.slot}-${index}`}
                                className={`rounded-[8px] px-2 py-1 text-[11px] leading-tight ${getPillColor('recommendation')}`}
                                style={{ height: PILL_HEIGHT }}
                              >
                                <p className="truncate font-semibold">{slot.slot}</p>
                                <p className="truncate">{slot.need}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          slots.length > 0 && (
                            <div
                              className="mx-auto w-full rounded-[8px] bg-red-300"
                              style={{ height: PILL_HEIGHT }}
                            />
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {staffGroups.map((group) => (
            <div key={group.key}>
              {group.rows.length > 0 && (
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <div className="sticky left-0 z-10 flex w-64 shrink-0 items-center border-r border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {group.label}
                  </div>
                  <div className="flex" style={{ width: timeGridWidth }}>
                    {columns.map((column) => (
                      <div
                        key={`${group.key}-header-${column.key}`}
                        className="border-r border-gray-200"
                        style={{
                          width: columnWidth,
                          minWidth: columnWidth,
                          height: 34,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {group.rows.map((row) => renderStaffRow(row))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
