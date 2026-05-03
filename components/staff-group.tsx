'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { StaffMember } from '@/lib/storage'

interface StaffGroupProps {
  title: string
  members: StaffMember[]
  groupType: 'provider' | 'non-clinical' | 'other'
}

export function StaffGroup({ title, members, groupType }: StaffGroupProps) {
  const [isOpen, setIsOpen] = useState(true)

  const getGroupBgColor = () => {
    switch (groupType) {
      case 'provider':
        return 'bg-white'
      case 'non-clinical':
        return 'bg-blue-50'
      case 'other':
        return 'bg-white'
      default:
        return 'bg-white'
    }
  }

  const getScheduleBgColor = () => {
    switch (groupType) {
      case 'provider':
        return 'bg-gray-100'
      case 'non-clinical':
        return 'bg-blue-100'
      case 'other':
        return 'bg-gray-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (members.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t">
      <CollapsibleTrigger className="flex w-full items-center justify-between bg-white px-4 py-3 hover:bg-gray-50">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className={getGroupBgColor()}>
        <div className="divide-y">
          {members.map((member) => (
            <div key={member.id} className="px-4 py-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="truncate text-xs text-gray-600">{member.title}</p>
                  {member.hoursPerWeek && (
                    <div className="mt-2 inline-block rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600">
                      {member.hoursPerWeek}
                    </div>
                  )}
                </div>
              </div>

              <div className={`rounded-lg p-3 text-center ${getScheduleBgColor()}`}>
                <p className="text-sm font-medium text-gray-900">{member.schedule}</p>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
