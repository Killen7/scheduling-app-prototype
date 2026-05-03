// Recommendation for understaffed slots
export interface Recommendation {
  id: string
  role: string
  need: string       // e.g. "Necesitas 1-3 personas"
  slots: string[]    // time ranges shown as pills
  location: string
  date: string       // YYYY-MM-DD
}

const recommendations: Recommendation[] = [
  // 1st Floor
  { id: 'r1',  role: 'Medical Assistant',       need: 'You need 2 persons', slots: ['8:00 AM - 4:00 PM'],                   location: '1st Floor', date: '2026-05-04' },
  { id: 'r2',  role: 'Registered Nurse',        need: 'You need 3 persons', slots: ['7:00 AM - 3:00 PM', '3:00 PM - 11:00 PM'], location: '1st Floor', date: '2026-05-05' },
  { id: 'r3',  role: 'Patient Care Technician', need: 'You need 1 person',  slots: ['12:00 PM - 8:00 PM'],                  location: '1st Floor', date: '2026-05-06' },
  { id: 'r4',  role: 'Medical Assistant',       need: 'You need 2 persons', slots: ['9:00 AM - 5:00 PM'],                   location: '1st Floor', date: '2026-05-07' },
  { id: 'r5',  role: 'Registered Nurse',        need: 'You need 3 persons', slots: ['8:00 AM - 4:00 PM', '4:00 PM - 12:00 AM'], location: '1st Floor', date: '2026-05-08' },
  // 2nd Floor
  { id: 'r6',  role: 'Dental Hygienist',        need: 'You need 1 person',  slots: ['8:00 AM - 12:00 PM'],                  location: '2nd Floor', date: '2026-05-04' },
  { id: 'r7',  role: 'Medical Assistant',       need: 'You need 2 persons', slots: ['9:00 AM - 5:00 PM'],                   location: '2nd Floor', date: '2026-05-05' },
  { id: 'r8',  role: 'Phlebotomist',            need: 'You need 3 persons', slots: ['7:00 AM - 3:00 PM', '11:00 AM - 7:00 PM'], location: '2nd Floor', date: '2026-05-06' },
  { id: 'r9',  role: 'Dental Hygienist',        need: 'You need 1 person',  slots: ['10:00 AM - 2:00 PM'],                  location: '2nd Floor', date: '2026-05-07' },
  { id: 'r10', role: 'Medical Assistant',       need: 'You need 2 persons', slots: ['8:00 AM - 4:00 PM'],                   location: '2nd Floor', date: '2026-05-08' },
  // 3rd Floor
  { id: 'r11', role: 'Surgical Technologist',   need: 'You need 2 persons', slots: ['6:00 AM - 2:00 PM', '2:00 PM - 10:00 PM'], location: '3rd Floor', date: '2026-05-04' },
  { id: 'r12', role: 'Radiologic Tech',         need: 'You need 1 person',  slots: ['8:00 AM - 4:00 PM'],                   location: '3rd Floor', date: '2026-05-05' },
  { id: 'r13', role: 'Surgical Technologist',   need: 'You need 2 persons', slots: ['7:00 AM - 3:00 PM'],                   location: '3rd Floor', date: '2026-05-06' },
  { id: 'r14', role: 'Respiratory Therapist',   need: 'You need 3 persons', slots: ['9:00 AM - 5:00 PM', '5:00 PM - 1:00 AM'], location: '3rd Floor', date: '2026-05-07' },
  { id: 'r15', role: 'Radiologic Tech',         need: 'You need 2 persons', slots: ['8:00 AM - 4:00 PM'],                   location: '3rd Floor', date: '2026-05-08' },
]

const RECOMMENDATIONS_KEY = 'teambuilder_recommendations_v2'

export function loadRecommendations(): Recommendation[] {
  if (typeof window === 'undefined') return recommendations
  const stored = localStorage.getItem(RECOMMENDATIONS_KEY)
  if (!stored) {
    localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations))
    return recommendations
  }
  return JSON.parse(stored)
}

// Types for the scheduling app
export interface StaffMember {
  id: string
  name: string
  title: string
  type: 'provider' | 'non-clinical' | 'clinical'
  hoursPerWeek?: number
  schedule: string
  location: string
  date: string // YYYY-MM-DD
}

export interface Location {
  id: string
  name: string
}

export const LOCATIONS: Location[] = [
  { id: '1', name: '1st Floor' },
  { id: '2', name: '2nd Floor' },
  { id: '3', name: '3rd Floor' },
]

// Week: Mon May 4 – Fri May 8, 2026
const WEEK = [
  '2026-05-04',
  '2026-05-05',
  '2026-05-06',
  '2026-05-07',
  '2026-05-08',
]

// Helper to generate an id
let _id = 1
const nid = () => String(_id++)

// ─── Raw schedule definitions ──────────────────────────────────────────────
// Each entry: [name, title, type, hoursPerWeek?, floor, perDay shifts]
// perDay is an object keyed by date → schedule string (or null = day off)

const mockData: StaffMember[] = [
  // ══════════════ 1st FLOOR ══════════════

  // PROVIDERS – 1st Floor
  { id: nid(), name: 'Martinez, Sofia',   title: 'Physician Assistant',           type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '1st Floor', date: '2026-05-04' },
  { id: nid(), name: 'Martinez, Sofia',   title: 'Physician Assistant',           type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '1st Floor', date: '2026-05-05' },
  { id: nid(), name: 'Martinez, Sofia',   title: 'Physician Assistant',           type: 'provider',     schedule: '10:00 AM - 6:00 PM', location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Martinez, Sofia',   title: 'Physician Assistant',           type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '1st Floor', date: '2026-05-07' },
  // Friday off — no entry for 05-08

  { id: nid(), name: 'Nguyen, Linda',     title: 'Doctor of Internal Medicine',   type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '1st Floor', date: '2026-05-04' },
  { id: nid(), name: 'Nguyen, Linda',     title: 'Doctor of Internal Medicine',   type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Nguyen, Linda',     title: 'Doctor of Internal Medicine',   type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-07' },
  { id: nid(), name: 'Nguyen, Linda',     title: 'Doctor of Internal Medicine',   type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '1st Floor', date: '2026-05-08' },

  { id: nid(), name: 'Torres, Miguel',    title: 'Family Medicine Physician',     type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-05' },
  { id: nid(), name: 'Torres, Miguel',    title: 'Family Medicine Physician',     type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Torres, Miguel',    title: 'Family Medicine Physician',     type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-07' },
  { id: nid(), name: 'Torres, Miguel',    title: 'Family Medicine Physician',     type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-08' },

  // NON-CLINICAL – 1st Floor
  { id: nid(), name: 'Johnson, Sarah',    title: 'Medical Secretary',             type: 'non-clinical', hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-04' },
  { id: nid(), name: 'Johnson, Sarah',    title: 'Medical Secretary',             type: 'non-clinical', hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-05' },
  { id: nid(), name: 'Johnson, Sarah',    title: 'Medical Secretary',             type: 'non-clinical', hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Johnson, Sarah',    title: 'Medical Secretary',             type: 'non-clinical', hoursPerWeek: 40,  schedule: '8:00 AM - 4:00 PM',  location: '1st Floor', date: '2026-05-07' },
  { id: nid(), name: 'Johnson, Sarah',    title: 'Medical Secretary',             type: 'non-clinical', hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '1st Floor', date: '2026-05-08' },

  { id: nid(), name: 'Okafor, Emeka',    title: 'Patient Services Coordinator',  type: 'non-clinical', hoursPerWeek: 32,  schedule: '9:00 AM - 5:00 PM',  location: '1st Floor', date: '2026-05-04' },
  { id: nid(), name: 'Okafor, Emeka',    title: 'Patient Services Coordinator',  type: 'non-clinical', hoursPerWeek: 32,  schedule: '9:00 AM - 5:00 PM',  location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Okafor, Emeka',    title: 'Patient Services Coordinator',  type: 'non-clinical', hoursPerWeek: 32,  schedule: '9:00 AM - 5:00 PM',  location: '1st Floor', date: '2026-05-08' },

  // CLINICAL – 1st Floor
  { id: nid(), name: 'Wilson, Bob',       title: 'Security Officer',              type: 'clinical',     hoursPerWeek: 40,  schedule: '6:00 AM - 2:00 PM',  location: '1st Floor', date: '2026-05-04' },
  { id: nid(), name: 'Wilson, Bob',       title: 'Security Officer',              type: 'clinical',     hoursPerWeek: 40,  schedule: '6:00 AM - 2:00 PM',  location: '1st Floor', date: '2026-05-05' },
  { id: nid(), name: 'Wilson, Bob',       title: 'Security Officer',              type: 'clinical',     hoursPerWeek: 40,  schedule: '6:00 AM - 2:00 PM',  location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Wilson, Bob',       title: 'Security Officer',              type: 'clinical',     hoursPerWeek: 40,  schedule: '2:00 PM - 10:00 PM', location: '1st Floor', date: '2026-05-07' },
  { id: nid(), name: 'Wilson, Bob',       title: 'Security Officer',              type: 'clinical',     hoursPerWeek: 40,  schedule: '6:00 AM - 2:00 PM',  location: '1st Floor', date: '2026-05-08' },

  { id: nid(), name: 'Perez, Carmen',     title: 'Lab Technician',                type: 'clinical',     hoursPerWeek: 20,  schedule: '8:00 AM - 12:00 PM', location: '1st Floor', date: '2026-05-04' },
  { id: nid(), name: 'Perez, Carmen',     title: 'Lab Technician',                type: 'clinical',     hoursPerWeek: 20,  schedule: '8:00 AM - 12:00 PM', location: '1st Floor', date: '2026-05-06' },
  { id: nid(), name: 'Perez, Carmen',     title: 'Lab Technician',                type: 'clinical',     hoursPerWeek: 20,  schedule: '8:00 AM - 12:00 PM', location: '1st Floor', date: '2026-05-08' },

  // ══════════════ 2nd FLOOR ══════════════

  // PROVIDERS – 2nd Floor
  { id: nid(), name: 'Andersons, Adam',   title: 'Doctor of Osteopathic Medicine',type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Andersons, Adam',   title: 'Doctor of Osteopathic Medicine',type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Andersons, Adam',   title: 'Doctor of Osteopathic Medicine',type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Andersons, Adam',   title: 'Doctor of Osteopathic Medicine',type: 'provider',     schedule: '10:00 AM - 6:00 PM', location: '2nd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Andersons, Adam',   title: 'Doctor of Osteopathic Medicine',type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Finch, Aaron',      title: 'Doctor of Dental Surgery',      type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Finch, Aaron',      title: 'Doctor of Dental Surgery',      type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Finch, Aaron',      title: 'Doctor of Dental Surgery',      type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Finch, Aaron',      title: 'Doctor of Dental Surgery',      type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Patel, Priya',      title: 'Psychiatrist',                  type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Patel, Priya',      title: 'Psychiatrist',                  type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Patel, Priya',      title: 'Psychiatrist',                  type: 'provider',     schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Patel, Priya',      title: 'Psychiatrist',                  type: 'provider',     schedule: '9:00 AM - 1:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  // NON-CLINICAL – 2nd Floor
  { id: nid(), name: 'Markam, Adam',      title: 'Admin Assistant',               type: 'non-clinical', hoursPerWeek: 22.7, schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Markam, Adam',      title: 'Admin Assistant',               type: 'non-clinical', hoursPerWeek: 22.7, schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Markam, Adam',      title: 'Admin Assistant',               type: 'non-clinical', hoursPerWeek: 22.7, schedule: '8:00 AM - 12:00 PM', location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Markam, Adam',      title: 'Admin Assistant',               type: 'non-clinical', hoursPerWeek: 22.7, schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Markam, Adam',      title: 'Admin Assistant',               type: 'non-clinical', hoursPerWeek: 22.7, schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Clinical, Adnan',   title: 'Clinical Research Assistant',   type: 'non-clinical', hoursPerWeek: 11.5, schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Clinical, Adnan',   title: 'Clinical Research Assistant',   type: 'non-clinical', hoursPerWeek: 11.5, schedule: '1:00 PM - 5:00 PM',  location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Clinical, Adnan',   title: 'Clinical Research Assistant',   type: 'non-clinical', hoursPerWeek: 11.5, schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Lee, Jennifer',     title: 'Billing Specialist',            type: 'non-clinical', hoursPerWeek: 36,  schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Lee, Jennifer',     title: 'Billing Specialist',            type: 'non-clinical', hoursPerWeek: 36,  schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Lee, Jennifer',     title: 'Billing Specialist',            type: 'non-clinical', hoursPerWeek: 36,  schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Lee, Jennifer',     title: 'Billing Specialist',            type: 'non-clinical', hoursPerWeek: 36,  schedule: '9:00 AM - 5:00 PM',  location: '2nd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Lee, Jennifer',     title: 'Billing Specialist',            type: 'non-clinical', hoursPerWeek: 36,  schedule: '10:00 AM - 2:00 PM', location: '2nd Floor', date: '2026-05-08' },

  // CLINICAL – 2nd Floor
  { id: nid(), name: 'Robert, Alice',     title: 'Phlebotomist',                  type: 'clinical',     hoursPerWeek: 8,   schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Robert, Alice',     title: 'Phlebotomist',                  type: 'clinical',     hoursPerWeek: 8,   schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Robert, Alice',     title: 'Phlebotomist',                  type: 'clinical',     hoursPerWeek: 8,   schedule: '8:00 AM - 4:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Gomez, Ricardo',    title: 'Medical Assistant',             type: 'clinical',     hoursPerWeek: 35,  schedule: '7:00 AM - 3:00 PM',  location: '2nd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Gomez, Ricardo',    title: 'Medical Assistant',             type: 'clinical',     hoursPerWeek: 35,  schedule: '7:00 AM - 3:00 PM',  location: '2nd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Gomez, Ricardo',    title: 'Medical Assistant',             type: 'clinical',     hoursPerWeek: 35,  schedule: '11:00 AM - 7:00 PM', location: '2nd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Gomez, Ricardo',    title: 'Medical Assistant',             type: 'clinical',     hoursPerWeek: 35,  schedule: '7:00 AM - 3:00 PM',  location: '2nd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Gomez, Ricardo',    title: 'Medical Assistant',             type: 'clinical',     hoursPerWeek: 35,  schedule: '7:00 AM - 3:00 PM',  location: '2nd Floor', date: '2026-05-08' },

  // ══════════════ 3rd FLOOR ══════════════

  // PROVIDERS – 3rd Floor
  { id: nid(), name: 'Kim, David',        title: 'Orthopedic Surgeon',            type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Kim, David',        title: 'Orthopedic Surgeon',            type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Kim, David',        title: 'Orthopedic Surgeon',            type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Kim, David',        title: 'Orthopedic Surgeon',            type: 'provider',     schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Hassan, Fatima',    title: 'Cardiologist',                  type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Hassan, Fatima',    title: 'Cardiologist',                  type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Hassan, Fatima',    title: 'Cardiologist',                  type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Hassan, Fatima',    title: 'Cardiologist',                  type: 'provider',     schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Hassan, Fatima',    title: 'Cardiologist',                  type: 'provider',     schedule: '8:00 AM - 12:00 PM', location: '3rd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Brown, Claire',     title: 'Neurologist',                   type: 'provider',     schedule: '10:00 AM - 6:00 PM', location: '3rd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Brown, Claire',     title: 'Neurologist',                   type: 'provider',     schedule: '10:00 AM - 6:00 PM', location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Brown, Claire',     title: 'Neurologist',                   type: 'provider',     schedule: '10:00 AM - 6:00 PM', location: '3rd Floor', date: '2026-05-08' },

  // NON-CLINICAL – 3rd Floor
  { id: nid(), name: 'Davis, Marcus',     title: 'Health Records Specialist',     type: 'non-clinical', hoursPerWeek: 40,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Davis, Marcus',     title: 'Health Records Specialist',     type: 'non-clinical', hoursPerWeek: 40,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Davis, Marcus',     title: 'Health Records Specialist',     type: 'non-clinical', hoursPerWeek: 40,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Davis, Marcus',     title: 'Health Records Specialist',     type: 'non-clinical', hoursPerWeek: 40,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Davis, Marcus',     title: 'Health Records Specialist',     type: 'non-clinical', hoursPerWeek: 40,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Ivanov, Natasha',   title: 'Insurance Coordinator',         type: 'non-clinical', hoursPerWeek: 28,  schedule: '9:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Ivanov, Natasha',   title: 'Insurance Coordinator',         type: 'non-clinical', hoursPerWeek: 28,  schedule: '9:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Ivanov, Natasha',   title: 'Insurance Coordinator',         type: 'non-clinical', hoursPerWeek: 28,  schedule: '9:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Ivanov, Natasha',   title: 'Insurance Coordinator',         type: 'non-clinical', hoursPerWeek: 28,  schedule: '9:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-08' },

  // CLINICAL – 3rd Floor
  { id: nid(), name: 'Taylor, James',     title: 'Radiologic Technologist',       type: 'clinical',     hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Taylor, James',     title: 'Radiologic Technologist',       type: 'clinical',     hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Taylor, James',     title: 'Radiologic Technologist',       type: 'clinical',     hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-06' },
  { id: nid(), name: 'Taylor, James',     title: 'Radiologic Technologist',       type: 'clinical',     hoursPerWeek: 40,  schedule: '3:00 PM - 11:00 PM', location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Taylor, James',     title: 'Radiologic Technologist',       type: 'clinical',     hoursPerWeek: 40,  schedule: '7:00 AM - 3:00 PM',  location: '3rd Floor', date: '2026-05-08' },

  { id: nid(), name: 'Nwosu, Chioma',     title: 'Respiratory Therapist',         type: 'clinical',     hoursPerWeek: 32,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-04' },
  { id: nid(), name: 'Nwosu, Chioma',     title: 'Respiratory Therapist',         type: 'clinical',     hoursPerWeek: 32,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-05' },
  { id: nid(), name: 'Nwosu, Chioma',     title: 'Respiratory Therapist',         type: 'clinical',     hoursPerWeek: 32,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-07' },
  { id: nid(), name: 'Nwosu, Chioma',     title: 'Respiratory Therapist',         type: 'clinical',     hoursPerWeek: 32,  schedule: '8:00 AM - 4:00 PM',  location: '3rd Floor', date: '2026-05-08' },
]

const STAFF_KEY = 'teambuilder_staff_v2'

export function loadStaff(): StaffMember[] {
  if (typeof window === 'undefined') return mockData

  const stored = localStorage.getItem(STAFF_KEY)
  if (!stored) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(mockData))
    return mockData
  }
  return JSON.parse(stored)
}

export function saveStaff(staff: StaffMember[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STAFF_KEY, JSON.stringify(staff))
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
  saveStaff(staff.filter(m => m.id !== id))
}
