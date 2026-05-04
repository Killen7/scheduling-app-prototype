import { NextResponse } from 'next/server'

const RULES: { keywords: string[]; suggestion: string; chips: { action: 'shift' | 'people' | 'offices'; label: string }[] }[] = [
  {
    keywords: ['understaffed', 'short', 'coverage', 'gap', 'fill'],
    suggestion: 'Based on current schedules, 1st Floor shows understaffing for the 8 AM–4 PM window. Consider creating a shift for a Medical Assistant or assigning available staff.',
    chips: [
      { action: 'shift', label: 'Create Shift' },
      { action: 'people', label: 'Find Available Staff' },
      { action: 'offices', label: 'Check Coverage' },
    ],
  },
  {
    keywords: ['today', 'available', 'who', 'working', 'free'],
    suggestion: 'Several staff members are available for shifts today. Browse the People panel to see real-time availability, or check each office for current headcount.',
    chips: [
      { action: 'people', label: 'Browse Available' },
      { action: 'offices', label: 'Office Coverage' },
      { action: 'shift', label: 'Create Shift' },
    ],
  },
  {
    keywords: ['floor', 'office', 'location', 'building'],
    suggestion: 'All three floors have active shifts today. The 3rd Floor has the highest coverage ratio. Check individual offices for detailed Gantt-style schedule views.',
    chips: [
      { action: 'offices', label: 'View All Offices' },
      { action: 'people', label: 'Browse Staff' },
      { action: 'shift', label: 'Create Shift' },
    ],
  },
  {
    keywords: ['assign', 'schedule', 'shift', 'create', 'add', 'new'],
    suggestion: "Ready to create a new shift. I'll walk you through selecting an office, date, and time — then match you with available staff based on their current schedules.",
    chips: [
      { action: 'shift', label: 'Start Creating Shift' },
      { action: 'people', label: 'Check Availability' },
      { action: 'offices', label: 'View Offices' },
    ],
  },
  {
    keywords: ['nurse', 'doctor', 'physician', 'provider', 'surgeon', 'therapist'],
    suggestion: 'I found several providers in the schedule. Use the People panel to filter by role and availability, or view an office to see all providers on shift today.',
    chips: [
      { action: 'people', label: 'Find Providers' },
      { action: 'offices', label: 'View by Office' },
      { action: 'shift', label: 'Create Shift' },
    ],
  },
]

const DEFAULT = {
  suggestion: 'I can help with scheduling assignments, staff availability, and office coverage. What would you like to explore?',
  chips: [
    { action: 'shift' as const, label: 'Create Shift' },
    { action: 'people' as const, label: 'Browse People' },
    { action: 'offices' as const, label: 'Check Offices' },
  ],
}

export async function POST(request: Request) {
  const { query } = await request.json() as { query: string }
  const q = (query ?? '').toLowerCase()

  for (const rule of RULES) {
    if (rule.keywords.some(kw => q.includes(kw))) {
      return NextResponse.json(rule)
    }
  }

  return NextResponse.json(DEFAULT)
}
