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
    <div className="inline-flex h-9 items-center rounded-lg border border-gray-300 bg-white p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 rounded-md px-4 text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
