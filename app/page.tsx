'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Filters } from '@/components/filters'
import { loadStaff, loadRecommendations, StaffMember, Recommendation } from '@/lib/storage'
import { ScheduleGrid } from '@/components/schedule-grid'
import { getMonthDates, getWeekDates, type ViewMode } from '@/lib/schedule-utils'
import { Plus } from 'lucide-react'
import { MCPPlayground } from '@/components/mcp-playground'

export default function Home() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([])
  const [selectedFloor, setSelectedFloor] = useState('2nd Floor')
  const [selectedDate, setSelectedDate] = useState('2026-05-04')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('day')

  useEffect(() => {
    setStaff(loadStaff())
    setAllRecommendations(loadRecommendations())
  }, [])

  const dateRange =
    viewMode === 'day'
      ? [selectedDate]
      : viewMode === 'week'
        ? getWeekDates(selectedDate)
        : getMonthDates(selectedDate.slice(0, 7))

  const selectedDates = new Set(dateRange)

  const recommendations = allRecommendations.filter(
    (recommendation) =>
      recommendation.location === selectedFloor &&
      selectedDates.has(recommendation.date)
  )

  const staffByFloorAndRange = staff.filter(
    (member) =>
      member.location === selectedFloor &&
      selectedDates.has(member.date)
  )

  const filteredStaff = staffByFloorAndRange.filter((member) => {
    if (selectedFilter === 'providers') return member.type === 'provider'
    if (selectedFilter === 'non-clinical') return member.type === 'non-clinical'
    if (selectedFilter === 'clinical') return member.type === 'clinical'
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="w-full">
        <Filters
          selectedFloor={selectedFloor}
          onFloorChange={setSelectedFloor}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="space-y-0">
          <ScheduleGrid
            staff={filteredStaff}
            recommendations={recommendations}
            viewMode={viewMode}
            selectedDate={selectedDate}
          />
        </div>

        <MCPPlayground />
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          const newStaff: StaffMember = {
            id: Date.now().toString(),
            name: 'New Staff',
            title: 'Position',
            type: 'clinical',
            schedule: '8:00 AM - 4:00 PM',
          }
          setStaff([...staff, newStaff])
        }}
        aria-label="Add shift"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
