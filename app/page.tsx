'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Filters } from '@/components/filters'
import { StaffGroup } from '@/components/staff-group'
import { loadStaff, saveStaff, StaffMember } from '@/lib/storage'
import { Plus } from 'lucide-react'

export default function Home() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedFloor, setSelectedFloor] = useState('2nd Floor')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  useEffect(() => {
    const loadedStaff = loadStaff()
    setStaff(loadedStaff)
  }, [])

  useEffect(() => {
    saveStaff(staff)
  }, [staff])

  const providers = staff.filter((s) => s.type === 'provider')
  const nonClinical = staff.filter((s) => s.type === 'non-clinical')
  const clinical = staff.filter((s) => s.type === 'clinical')

  const filteredStaff = (members: StaffMember[]) => {
    if (selectedFilter === 'all' || !selectedFilter) return members
    if (selectedFilter === 'available') {
      return members.filter((m) => m.schedule.includes('AM') || m.schedule.includes('PM'))
    }
    return members
  }

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
          <StaffGroup
            title="PROVIDERS"
            members={filteredStaff(providers)}
            groupType="provider"
          />
          <StaffGroup
            title="NON-CLINICAL STAFF"
            members={filteredStaff(nonClinical)}
            groupType="non-clinical"
          />
          <StaffGroup title="CLINICAL STAFF" members={filteredStaff(clinical)} groupType="clinical" />
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
