'use client'

import { CalendarIcon } from 'lucide-react'
import { ViewSwitcher } from '@/components/view-switcher'
import type { ViewMode } from '@/lib/schedule-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FiltersProps {
  selectedFloor: string
  onFloorChange: (floor: string) => void
  selectedDate: string
  onDateChange: (date: string) => void
  selectedFilter: string
  onFilterChange: (filter: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

const FLOORS = ['1st Floor', '2nd Floor', '3rd Floor']

// Mon–Fri May 4–8 2026
const WEEK_DAYS = [
  { value: '2026-05-04', label: 'Mon 05/04/2026' },
  { value: '2026-05-05', label: 'Tue 05/05/2026' },
  { value: '2026-05-06', label: 'Wed 05/06/2026' },
  { value: '2026-05-07', label: 'Thu 05/07/2026' },
  { value: '2026-05-08', label: 'Fri 05/08/2026' },
]

function formatDate(value: string) {
  const day = WEEK_DAYS.find((d) => d.value === value)
  if (day) return day.label
  // fallback: parse and format
  const [y, m, d] = value.split('-')
  return `${m}/${d}/${y}`
}

export function Filters({
  selectedFloor,
  onFloorChange,
  selectedDate,
  onDateChange,
  selectedFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: FiltersProps) {
  return (
    <div className="border-b bg-white px-4 py-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-4 justify-self-start">
          <ViewSwitcher value={viewMode} onChange={onViewModeChange} />

          <Select value={selectedFloor} onValueChange={onFloorChange}>
            <SelectTrigger className="w-[150px] rounded-lg border border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FLOORS.map((floor) => (
                <SelectItem key={floor} value={floor}>
                  {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedDate} onValueChange={onDateChange}>
          <SelectTrigger className="w-[190px] rounded-lg border border-gray-300">
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <SelectValue>{formatDate(selectedDate)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {WEEK_DAYS.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-[220px] justify-self-end">
          <Select value={selectedFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full rounded-lg border border-gray-300">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="providers">Providers Only</SelectItem>
              <SelectItem value="non-clinical">Non-Clinical Only</SelectItem>
              <SelectItem value="clinical">Clinical Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
