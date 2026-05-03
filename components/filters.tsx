'use client'

import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FiltersProps {
  selectedFloor: string
  onFloorChange: (floor: string) => void
  selectedDate: string
  onDateChange: (date: string) => void
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

const FLOORS = ['1st Floor', '2nd Floor', '3rd Floor']

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

        {/* Date Picker */}
        <Button
          variant="outline"
          className={cn(
            'flex-1 justify-start rounded-lg border border-gray-300 text-left font-normal'
          )}
          onClick={(e) => {
            const input = document.createElement('input')
            input.type = 'date'
            input.value = selectedDate
            input.onchange = (event) => {
              const target = event.target as HTMLInputElement
              onDateChange(target.value)
            }
            input.click()
          }}
        >
          <span>{selectedDate}</span>
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </div>

      {/* Filter By */}
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full rounded-lg border border-gray-300">
          <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Staff</SelectItem>
          <SelectItem value="available">Available Today</SelectItem>
          <SelectItem value="providers">Providers Only</SelectItem>
          <SelectItem value="non-clinical">Non-Clinical Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
