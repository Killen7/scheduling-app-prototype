'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Filters } from '@/components/filters'
import type { StaffMember, Recommendation } from '@/lib/storage'
import { ScheduleGrid } from '@/components/schedule-grid'
import { getMonthDates, getWeekDates, type ViewMode } from '@/lib/schedule-utils'
import { Plus } from 'lucide-react'
import { MCPPlayground } from '@/components/mcp-playground'

type OfficeOption = {
  id: string
  name: string
}

type OfficeResponse = {
  items: OfficeOption[]
}

type ScheduleResponse = {
  demo?: {
    staff: StaffMember[]
  }
}

export default function Home() {
  const [offices, setOffices] = useState<OfficeOption[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([])
  const [selectedOfficeId, setSelectedOfficeId] = useState('')
  const [selectedDate, setSelectedDate] = useState('2026-05-04')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOffices() {
      const response = await fetch('/api/app/office')
      if (!response.ok) throw new Error('Failed to load offices.')

      const data = (await response.json()) as OfficeResponse
      setOffices(data.items)

      const defaultOffice = data.items.find((office) => office.name === '2nd Floor') ?? data.items[0]
      if (defaultOffice) setSelectedOfficeId(defaultOffice.id)
    }

    loadOffices().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load offices.')
      setIsLoading(false)
    })
  }, [])

  const dateRange =
    viewMode === 'day'
      ? [selectedDate]
      : viewMode === 'week'
        ? getWeekDates(selectedDate)
        : getMonthDates(selectedDate.slice(0, 7))

  const selectedDates = new Set(dateRange)
  const rangeStart = dateRange[0]
  const rangeEnd = dateRange[dateRange.length - 1]
  const selectedOffice = offices.find((office) => office.id === selectedOfficeId)

  useEffect(() => {
    if (!selectedOfficeId || !rangeStart || !rangeEnd) return

    async function loadScheduleData() {
      setIsLoading(true)
      setError(null)

      const scheduleParams = new URLSearchParams()
      scheduleParams.append('OfficeIds', selectedOfficeId)
      scheduleParams.set('BeginDate', rangeStart)
      scheduleParams.set('EndDate', rangeEnd)
      scheduleParams.set('IsLocationsView', 'true')

      const recommendationParams = new URLSearchParams()
      recommendationParams.set('officeId', selectedOfficeId)
      recommendationParams.set('BeginDate', rangeStart)
      recommendationParams.set('EndDate', rangeEnd)

      const [scheduleResponse, recommendationResponse] = await Promise.all([
        fetch(`/api/app/schedule/v2?${scheduleParams.toString()}`),
        fetch(`/api/app/recommendation/recommendation-items?${recommendationParams.toString()}`),
      ])

      if (!scheduleResponse.ok) throw new Error('Failed to load schedule.')
      if (!recommendationResponse.ok) throw new Error('Failed to load recommendations.')

      const scheduleData = (await scheduleResponse.json()) as ScheduleResponse
      const recommendationData = (await recommendationResponse.json()) as Recommendation[]

      setStaff(scheduleData.demo?.staff ?? [])
      setAllRecommendations(recommendationData)
      setIsLoading(false)
    }

    loadScheduleData().catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load schedule data.')
      setStaff([])
      setAllRecommendations([])
      setIsLoading(false)
    })
  }, [selectedOfficeId, rangeStart, rangeEnd])

  const recommendations = allRecommendations.filter((recommendation) => selectedDates.has(recommendation.date))

  const filteredStaff = staff.filter((member) => {
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
          selectedFloor={selectedOfficeId}
          onFloorChange={setSelectedOfficeId}
          floors={offices}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="space-y-0">
          {error && (
            <div className="mx-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && !error ? (
            <div className="mx-4 rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading schedule from Supabase...
            </div>
          ) : (
            <ScheduleGrid
              staff={filteredStaff}
              recommendations={recommendations}
              viewMode={viewMode}
              selectedDate={selectedDate}
            />
          )}
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
            location: selectedOffice?.name ?? '2nd Floor',
            date: selectedDate,
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
