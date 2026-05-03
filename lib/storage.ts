// Types for the scheduling app
export interface StaffMember {
  id: string
  name: string
  title: string
  type: 'provider' | 'non-clinical' | 'clinical'
  hoursPerWeek?: number
  schedule: string
  location?: string
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
    title: 'Doctor of Osteopathic Medicine',
    type: 'provider',
    schedule: '8:00 AM - 4:00 PM',
    location: '2nd Floor',
  },
  {
    id: '2',
    name: 'Finch, Aaron',
    title: 'Doctor of Dental Surgery',
    type: 'provider',
    schedule: '8:00 AM - 4:00 PM',
    location: '2nd Floor',
  },
  {
    id: '3',
    name: 'Martinez, Sofia',
    title: 'Physician Assistant',
    type: 'provider',
    schedule: '9:00 AM - 5:00 PM',
    location: '1st Floor',
  },
  // Non-clinical staff
  {
    id: '4',
    name: 'Adam Markam',
    title: 'Admin Assistant',
    type: 'non-clinical',
    hoursPerWeek: 22.7,
    schedule: '8:00 AM - 4:00 PM',
    location: '2nd Floor',
  },
  {
    id: '5',
    name: 'Adnan Clinical',
    title: 'Clinical Research Assistant',
    type: 'non-clinical',
    hoursPerWeek: 11.5,
    schedule: '8:00 AM - 4:00 PM',
    location: '2nd Floor',
  },
  {
    id: '6',
    name: 'Sarah Johnson',
    title: 'Medical Secretary',
    type: 'non-clinical',
    hoursPerWeek: 40,
    schedule: '7:00 AM - 3:00 PM',
    location: '1st Floor',
  },
  // Clinical staff
  {
    id: '7',
    name: 'Alice Robert',
    title: 'Maintenance Technician',
    type: 'clinical',
    hoursPerWeek: 8,
    schedule: '8:00 AM - 4:00 PM',
    location: '2nd Floor',
  },
  {
    id: '8',
    name: 'Bob Wilson',
    title: 'Security Officer',
    type: 'clinical',
    hoursPerWeek: 12,
    schedule: '6:00 AM - 6:00 PM',
    location: '1st Floor',
  },
]

const STAFF_KEY = 'teambuilder_staff'
const LOCATIONS_KEY = 'teambuilder_locations'

export function loadStaff(): StaffMember[] {
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
  const staff = loadStaff()
  const newMember = { ...member, id: Date.now().toString() }
  staff.push(newMember)
  saveStaff(staff)
  return newMember
}

export function updateStaffMember(id: string, updates: Partial<StaffMember>): void {
  const staff = loadStaff()
  const index = staff.findIndex(m => m.id === id)
  if (index !== -1) {
    staff[index] = { ...staff[index], ...updates }
    saveStaff(staff)
  }
}

export function deleteStaffMember(id: string): void {
  const staff = loadStaff()
  const filtered = staff.filter(m => m.id !== id)
  saveStaff(filtered)
}
