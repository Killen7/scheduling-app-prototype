'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Filters } from '@/components/filters'
import { StaffGroup } from '@/components/staff-group'
import { loadStaff, saveStaff, StaffMember } from '@/lib/storage'
import { Button } from '@/components/ui/button'
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
  const other = staff.filter((s) => s.type === 'other')

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

        <div className="mt-6 space-y-0">
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
          <StaffGroup title="OTHER" members={filteredStaff(other)} groupType="other" />
        </div>

        <div className="sticky bottom-6 right-6 flex justify-center px-4 py-6">
          <Button
            size="lg"
            className="gap-2 rounded-full"
            onClick={() => {
              const newStaff: StaffMember = {
                id: Date.now().toString(),
                name: 'New Staff',
                title: 'Position',
                type: 'other',
                schedule: '8:00 AM - 4:00 PM',
              }
              setStaff([...staff, newStaff])
            }}
          >
            <Plus className="h-5 w-5" />
            Add Staff
          </Button>
        </div>
      </main>
    </div>
  )
}
