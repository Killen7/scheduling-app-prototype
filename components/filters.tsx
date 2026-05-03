'use client'

import { Calendar as CalendarIcon } from 'lucide-react'
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
import { format } from 'date-fns'
import type { Location } from '@/lib/storage'

interface FiltersProps {
  locations: Location[]
  selectedLocation: string
  onLocationChange: (location: string) => void
  selectedDate: Date
  onDateChange: (date: Date) => void
  filterBy: string
  onFilterByChange: (filter: string) => void
}

export function Filters({
  locations,
  selectedLocation,
  onLocationChange,
  selectedDate,
  onDateChange,
  filterBy,
  onFilterByChange,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex gap-3">
        {/* Location Select */}
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <span className="truncate">{format(selectedDate, 'MM/dd/yyyy')}</span>
              <CalendarIcon className="ml-auto size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Filter By */}
      <Select value={filterBy} onValueChange={onFilterByChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Filter by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Staff</SelectItem>
          <SelectItem value="providers">Providers Only</SelectItem>
          <SelectItem value="non-clinical">Non-Clinical Only</SelectItem>
          <SelectItem value="other">Other Staff Only</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
