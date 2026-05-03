'use client'

import { CalendarIcon } from 'lucide-react'
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
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b bg-white px-4 py-4">
      <div className="flex gap-3">
        {/* Floor Select */}
        <Select value={selectedFloor} onValueChange={onFloorChange}>
          <SelectTrigger className="flex-1 rounded-lg border border-gray-300">
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

        {/* Date Select */}
        <Select value={selectedDate} onValueChange={onDateChange}>
          <SelectTrigger className="flex-1 rounded-lg border border-gray-300">
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
      </div>

      {/* Filter By */}
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
  )
}
