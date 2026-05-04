'use client'

import { useEffect, useState } from 'react'
import { CalendarIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

interface SpotlightProps {
  onShiftCreatedSuccess?: () => Promise<void> | void
}

export function Spotlight({ onShiftCreatedSuccess }: SpotlightProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const shouldShowCreateShift = query.trim().toLowerCase().startsWith('create')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k') return
      if (!event.metaKey && !event.ctrlKey) return
      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  return (
    <>
      <Button
        variant="outline"
        className="h-9 gap-2 border-gray-300 text-neutral-700"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Spotlight
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        modal={false}
        title="Spotlight"
        description="Quick access to offices and people."
        className="max-w-[560px]"
      >
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search..."
        />
        {shouldShowCreateShift && (
          <CommandList>
            <CommandGroup heading="Actions">
              <CommandItem
                value="create shift"
                onSelect={() => {
                  void onShiftCreatedSuccess?.()
                }}
                className="data-[selected=true]:bg-neutral-100 data-[selected=true]:text-neutral-900"
              >
                <CalendarIcon className="size-4" />
                <span>Create Shift</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        )}
      </CommandDialog>
    </>
  )
}
