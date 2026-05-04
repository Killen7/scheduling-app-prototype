'use client'

import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LightshotBar } from '@/components/lightshot/LightshotBar'
import { Spotlight } from '@/components/spotlight'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface HeaderProps {
  onMenuClick?: () => void
  onShiftCreatedSuccess?: () => Promise<void> | void
}

export function Header({ onMenuClick, onShiftCreatedSuccess }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="size-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2">
            <Button variant="ghost" className="justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" className="justify-start">
              Staff Management
            </Button>
            <Button variant="ghost" className="justify-start">
              Locations
            </Button>
            <Button variant="ghost" className="justify-start">
              Reports
            </Button>
            <Button variant="ghost" className="justify-start">
              Settings
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-1">
        <span className="text-lg font-bold tracking-tight text-neutral-900">TeamBuilderAI</span>
      </div>

      <div className="flex items-center gap-2">
        <LightshotBar />
        <Spotlight onShiftCreatedSuccess={onShiftCreatedSuccess} />
        <Button variant="ghost" size="icon">
          <Bell className="size-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
