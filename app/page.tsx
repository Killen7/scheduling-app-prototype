'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Filters } from '@/components/filters'
import { StaffGroup } from '@/components/staff-group'
import { loadStaff, StaffMember } from '@/lib/storage'
import { Plus } from 'lucide-react'

export default function Home() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedFloor, setSelectedFloor] = useState('2nd Floor')
  const [selectedDate, setSelectedDate] = useState('2026-05-04')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  useEffect(() => {
    const loadedStaff = loadStaff()
    setStaff(loadedStaff)
  }, [])

  // Filter by floor + date first, then by staff type
  const byFloorAndDate = staff.filter(
    (s) => s.location === selectedFloor && s.date === selectedDate
  )

  const providers = byFloorAndDate.filter((s) => s.type === 'provider')
  const nonClinical = byFloorAndDate.filter((s) => s.type === 'non-clinical')
  const clinical = byFloorAndDate.filter((s) => s.type === 'clinical')

  const visibleProviders   = selectedFilter === 'all' || selectedFilter === 'providers'    ? providers   : []
  const visibleNonClinical = selectedFilter === 'all' || selectedFilter === 'non-clinical' ? nonClinical : []
  const visibleClinical    = selectedFilter === 'all' || selectedFilter === 'clinical'     ? clinical    : []

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-2xl">
        <Filters
          selectedFloor={selectedFloor}
          onFloorChange={setSelectedFloor}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <div className="space-y-0">
          <StaffGroup title="PROVIDERS"        members={visibleProviders}   groupType="provider"      />
          <StaffGroup title="NON-CLINICAL STAFF" members={visibleNonClinical} groupType="non-clinical"  />
          <StaffGroup title="CLINICAL STAFF"  members={visibleClinical}    groupType="clinical"     />
        </div>
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
