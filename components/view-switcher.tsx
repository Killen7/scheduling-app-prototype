'use client'

import { cn } from '@/lib/utils'
import type { ViewMode } from '@/lib/schedule-utils'

interface ViewSwitcherProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  const options: { value: ViewMode; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]

  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
