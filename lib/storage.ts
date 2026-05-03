// Types for the scheduling app
export interface StaffMember {
  id: string
  name: string
  role: string
  category: 'providers' | 'non-clinical' | 'other'
  hours?: number
  schedule: {
    startTime: string
    endTime: string
  }
  location: string
}

export interface Location {
  id: string
  name: string
}

// Default data
const defaultLocations: Location[] = [
  { id: '1', name: '1st Floor' },
  { id: '2', name: '2nd Floor' },
  { id: '3', name: '3rd Floor' },
]

const defaultStaff: StaffMember[] = [
  // Providers
  {
    id: '1',
    name: 'Andersons, Adam',
    role: 'Doctor of Osteopathic Medicine',
    category: 'providers',
    schedule: { startTime: '8:00 AM', endTime: '4:00 PM' },
    location: '2',
  },
  {
    id: '2',
    name: 'Finch, Aaron',
    role: 'Doctor of Dental Surgery',
    category: 'providers',
    schedule: { startTime: '8:00 AM', endTime: '4:00 PM' },
    location: '2',
  },
  {
    id: '3',
    name: 'Martinez, Sofia',
    role: 'Physician Assistant',
    category: 'providers',
    schedule: { startTime: '9:00 AM', endTime: '5:00 PM' },
    location: '1',
  },
  // Non-clinical staff
  {
    id: '4',
    name: 'Adam Markam',
    role: 'Admin Assistant',
    category: 'non-clinical',
    hours: 22.7,
    schedule: { startTime: '8:00 AM', endTime: '4:00 PM' },
    location: '2',
  },
  {
    id: '5',
    name: 'Adnan Clinical',
    role: 'Clinical Research Assistant',
    category: 'non-clinical',
    hours: 11.5,
    schedule: { startTime: '8:00 AM', endTime: '4:00 PM' },
    location: '2',
  },
  {
    id: '6',
    name: 'Sarah Johnson',
    role: 'Medical Secretary',
    category: 'non-clinical',
    hours: 40,
    schedule: { startTime: '7:00 AM', endTime: '3:00 PM' },
    location: '1',
  },
  // Other staff
  {
    id: '7',
    name: 'Alice Robert',
    role: 'Maintenance Technician',
    category: 'other',
    hours: 8,
    schedule: { startTime: '8:00 AM', endTime: '4:00 PM' },
    location: '2',
  },
  {
    id: '8',
    name: 'Bob Wilson',
    role: 'Security Officer',
    category: 'other',
    hours: 12,
    schedule: { startTime: '6:00 AM', endTime: '6:00 PM' },
    location: '1',
  },
]

const STAFF_KEY = 'teambuilder_staff'
const LOCATIONS_KEY = 'teambuilder_locations'

export function getStaff(): StaffMember[] {
  if (typeof window === 'undefined') return defaultStaff
  
  const stored = localStorage.getItem(STAFF_KEY)
  if (!stored) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(defaultStaff))
    return defaultStaff
  }
  return JSON.parse(stored)
}

export function saveStaff(staff: StaffMember[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff))
}

export function getLocations(): Location[] {
  if (typeof window === 'undefined') return defaultLocations
  
  const stored = localStorage.getItem(LOCATIONS_KEY)
  if (!stored) {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(defaultLocations))
    return defaultLocations
  }
  return JSON.parse(stored)
}

export function saveLocations(locations: Location[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations))
}

export function addStaffMember(member: Omit<StaffMember, 'id'>): StaffMember {
  const staff = getStaff()
  const newMember = { ...member, id: Date.now().toString() }
  staff.push(newMember)
  saveStaff(staff)
  return newMember
}

export function updateStaffMember(id: string, updates: Partial<StaffMember>): void {
  const staff = getStaff()
  const index = staff.findIndex(m => m.id === id)
  if (index !== -1) {
    staff[index] = { ...staff[index], ...updates }
    saveStaff(staff)
  }
}

export function deleteStaffMember(id: string): void {
  const staff = getStaff()
  const filtered = staff.filter(m => m.id !== id)
  saveStaff(filtered)
}
