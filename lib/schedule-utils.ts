// Utility functions for schedule time calculations

export type ViewMode = 'day' | 'week' | 'month'

// Parse time string like "8:00 AM" to hour (0-23)
export function parseTimeToHour(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  
  let hour = parseInt(match[1], 10)
  const isPM = match[3].toUpperCase() === 'PM'
  
  if (hour === 12) {
    hour = isPM ? 12 : 0
  } else if (isPM) {
    hour += 12
  }
  
  return hour
}

// Parse time string like "8:30 AM" to minutes since midnight
export function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0

  let hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)
  const isPM = match[3].toUpperCase() === 'PM'

  if (hour === 12) {
    hour = isPM ? 12 : 0
  } else if (isPM) {
    hour += 12
  }

  return hour * 60 + minute
}

// Parse schedule string like "8:00 AM - 4:00 PM" to start/end hours
export function parseSchedule(schedule: string): { startHour: number; endHour: number; duration: number } {
  const parts = schedule.split(' - ')
  if (parts.length !== 2) return { startHour: 0, endHour: 0, duration: 0 }
  
  const startHour = parseTimeToHour(parts[0].trim())
  let endHour = parseTimeToHour(parts[1].trim())
  
  // Handle overnight shifts (e.g., 10:00 PM - 6:00 AM)
  if (endHour <= startHour) {
    endHour += 24
  }
  
  const duration = endHour - startHour
  return { startHour, endHour: endHour % 24, duration }
}

// Parse schedule string to minute-based values
export function parseScheduleToMinutes(
  schedule: string
): { startMinutes: number; endMinutes: number; durationMinutes: number } {
  const parts = schedule.split(' - ')
  if (parts.length !== 2) return { startMinutes: 0, endMinutes: 0, durationMinutes: 0 }

  const startMinutes = parseTimeToMinutes(parts[0].trim())
  let endMinutes = parseTimeToMinutes(parts[1].trim())

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }

  return {
    startMinutes,
    endMinutes: endMinutes % (24 * 60),
    durationMinutes: endMinutes - startMinutes,
  }
}

// Calculate pill position and width for daily view (90px per hour)
export function getDailyPillStyle(schedule: string): { left: number; width: number } {
  const { startMinutes, durationMinutes } = parseScheduleToMinutes(schedule)
  const HOUR_WIDTH = 90
  
  return {
    left: (startMinutes / 60) * HOUR_WIDTH,
    width: Math.max((durationMinutes / 60) * HOUR_WIDTH, HOUR_WIDTH / 2), // minimum 30 minutes width
  }
}

// Format hour for display (0-23 to "12 AM", "1 PM", etc.)
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

// Get array of hours for daily view header
export function getDailyHours(): number[] {
  return Array.from({ length: 24 }, (_, i) => i)
}

// Get array of dates for weekly view (Mon-Sun starting from a date)
export function getWeekDates(startDate: string): string[] {
  const start = new Date(startDate)
  // Adjust to Monday if not already
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

// Get array of dates for monthly view
export function getMonthDates(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    return `${yearMonth}-${day}`
  })
}

// Format date for display
export function formatDate(dateStr: string, format: 'short' | 'day' | 'full' = 'short'): string {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  if (format === 'day') {
    return days[date.getDay()]
  }
  if (format === 'full') {
    return `${days[date.getDay()]} ${date.getDate()}`
  }
  return `${months[date.getMonth()]} ${date.getDate()}`
}
