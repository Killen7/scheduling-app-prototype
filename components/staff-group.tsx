'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { StaffMember } from '@/lib/storage'

interface StaffGroupProps {
  title: string
  members: StaffMember[]
  groupType: 'provider' | 'non-clinical' | 'clinical'
}

export function StaffGroup({ title, members, groupType }: StaffGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  const schedulePillClass =
    groupType === 'provider'
      ? 'bg-gray-100 text-gray-900'
      : 'bg-blue-100 text-blue-900'

  if (members.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t border-gray-200">
      {/* Section header */}
      <CollapsibleTrigger className="flex w-full items-center justify-between bg-white px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </CollapsibleTrigger>
      {/* Divider below header */}
      <div className="h-px bg-gray-200" />

      <CollapsibleContent>
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.id} className="flex items-stretch border-b border-gray-200">
              {/* Left column: name, title, hours */}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-4">
                <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
                <p className="truncate text-xs text-gray-500">{member.title}</p>
                {member.hoursPerWeek !== undefined && (
                  <div className="mt-1 inline-flex w-fit items-center rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600">
                    {member.hoursPerWeek}
                  </div>
                )}
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-gray-200" />

              {/* Right column: schedule pill */}
              <div className="flex w-[55%] shrink-0 items-center justify-center px-3 py-4">
                <div className={`w-full rounded-lg px-3 py-3 text-center text-sm font-medium ${schedulePillClass}`}>
                  {member.schedule}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
