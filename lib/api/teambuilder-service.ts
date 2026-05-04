import { createClient } from '@supabase/supabase-js'
import type { Recommendation, StaffMember } from '@/lib/storage'

type OfficeRow = {
  id: string
  name: string
  created_at: string
}

type PersonnelRow = {
  id: string
  name: string
  title: string
  type: StaffMember['type']
  hours_per_week: number | null
}

type ShiftRow = {
  id: string
  date: string
  schedule: string
  personnel: PersonnelRow | PersonnelRow[]
  offices: Pick<OfficeRow, 'id' | 'name'> | Pick<OfficeRow, 'id' | 'name'>[]
}

type RecommendationRow = {
  id: string
  role: string
  need: string
  slots: string[]
  date: string
  offices: Pick<OfficeRow, 'id' | 'name'> | Pick<OfficeRow, 'id' | 'name'>[]
}

type StaffAvailabilityRangeRow = {
  personnel_id: string
  office_id: string
  begin_date: string
  end_date: string
  personnel: Pick<PersonnelRow, 'id' | 'name' | 'title' | 'type'> | Array<Pick<PersonnelRow, 'id' | 'name' | 'title' | 'type'>>
}

type AvailabilityInputPeriod = {
  beginDate: string
  endDate: string
}

type StaffAvailabilityInput = {
  officeId: string
  dates: AvailabilityInputPeriod[]
}

export type OfficeOption = {
  id: string
  name: string
}

type ShiftInsertRow = {
  id: string
  date: string
  schedule: string
  office_id: string
  personnel_id: string
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}

function toArrayValue<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value
}

function getPersonnelCategory(type: StaffMember['type']) {
  if (type === 'provider') return 1
  if (type === 'non-clinical') return 2
  return 3
}

function getPersonnelLabel(type: StaffMember['type']) {
  if (type === 'provider') return 'Providers'
  if (type === 'non-clinical') return 'Non-Clinical Staff'
  return 'Clinical Staff'
}

function buildDateTime(date: string, time: string) {
  return `${date}T${time}`
}

function parseSchedule(schedule: string) {
  const [beginTime, endTime] = schedule.split(' - ')
  return { beginTime, endTime }
}

function parseTimeToMinutes(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0

  let hour = Number(match[1])
  const minutes = Number(match[2])
  const ampm = match[3].toUpperCase()

  if (hour === 12) hour = ampm === 'AM' ? 0 : 12
  else if (ampm === 'PM') hour += 12

  return hour * 60 + minutes
}

function scheduleToRangeForDate(date: string, schedule: string) {
  const { beginTime, endTime } = parseSchedule(schedule)
  if (!beginTime || !endTime) return null

  const startMinutes = parseTimeToMinutes(beginTime)
  let endMinutes = parseTimeToMinutes(endTime)
  if (endMinutes <= startMinutes) endMinutes += 24 * 60

  const start = new Date(`${date}T00:00:00.000Z`)
  start.setUTCMinutes(startMinutes)

  const end = new Date(`${date}T00:00:00.000Z`)
  end.setUTCMinutes(endMinutes)

  return {
    beginDate: start.toISOString(),
    endDate: end.toISOString(),
    startMinutes,
    endMinutes,
  }
}

function dateToUtcDayPeriod(date: string): AvailabilityInputPeriod {
  return {
    beginDate: `${date}T00:00:00.000Z`,
    endDate: `${date}T23:59:59.999Z`,
  }
}

function getPreviousDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

function rangesOverlap(
  left: { beginDate: string; endDate: string },
  right: { beginDate: string; endDate: string }
) {
  const leftStart = new Date(left.beginDate).getTime()
  const leftEnd = new Date(left.endDate).getTime()
  const rightStart = new Date(right.beginDate).getTime()
  const rightEnd = new Date(right.endDate).getTime()
  return leftStart < rightEnd && rightStart < leftEnd
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isValidSchedule(value: string) {
  return /^\d{1,2}:\d{2}\s(?:AM|PM)\s-\s\d{1,2}:\d{2}\s(?:AM|PM)$/i.test(value)
}

type MatchResult<T> = {
  selected: T | null
  candidates: T[]
}

function pickBestMatch<T extends { id: string }>(
  options: T[],
  getLabel: (option: T) => string,
  query: string
): MatchResult<T> {
  const normalizedQuery = normalizeText(query)
  const exact = options.filter((option) => normalizeText(getLabel(option)) === normalizedQuery)
  if (exact.length === 1) return { selected: exact[0], candidates: exact }

  const startsWith = options.filter((option) =>
    normalizeText(getLabel(option)).startsWith(normalizedQuery)
  )
  if (startsWith.length === 1) return { selected: startsWith[0], candidates: startsWith }

  const includes = options.filter((option) =>
    normalizeText(getLabel(option)).includes(normalizedQuery)
  )
  if (includes.length === 1) return { selected: includes[0], candidates: includes }

  if (exact.length > 1) return { selected: null, candidates: exact }
  if (startsWith.length > 1) return { selected: null, candidates: startsWith }
  return { selected: null, candidates: includes }
}

export async function getOffices() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('offices')
    .select('id, name, created_at')
    .order('name')
    .returns<OfficeRow[]>()

  if (error) throw error

  const items = (data ?? []).map((office) => ({
    id: office.id,
    creationTime: office.created_at,
    creatorId: null,
    lastModificationTime: null,
    lastModifierId: null,
    name: office.name,
    regionId: '00000000-0000-0000-0000-000000000000',
    regionName: 'Demo Region',
    timeZone: null,
    timeZoneIana: 'America/New_York',
    clinicalStaffRatio: null,
    nonClinicalStaffRatio: null,
    externalOfficeId: office.id,
    region: null,
    building: null,
    beginTime: 0,
    endTime: 24,
    beginTimeDisplay: '12:00 AM',
    endTimeDisplay: '11:59 PM',
  }))

  return {
    totalCount: items.length,
    items,
  }
}

export async function getStaffMembers(searchParams: URLSearchParams) {
  const supabase = getSupabase()
  const skipCount = Number(searchParams.get('SkipCount') ?? 0)
  const maxResultCount = Number(searchParams.get('MaxResultCount') ?? 1000)

  const { data, error, count } = await supabase
    .from('personnel')
    .select('id, name, title, type, hours_per_week', { count: 'exact' })
    .order('name')
    .range(skipCount, skipCount + maxResultCount - 1)
    .returns<PersonnelRow[]>()

  if (error) throw error

  const items = (data ?? []).map((person) => ({
    maxResultCount,
    skipCount,
    sorting: searchParams.get('Sorting'),
    id: person.id,
    personnelType: person.type,
    personnelTypeCategoryId: getPersonnelCategory(person.type),
    staffRole: person.title,
    availabilities: [],
    userType: [person.type],
    name: person.name,
    surName: null,
    email: null,
    speciality: person.title,
    userId: person.id,
  }))

  return {
    totalCount: count ?? items.length,
    items,
  }
}

export async function getScheduleV2(searchParams: URLSearchParams) {
  const supabase = getSupabase()
  const officeIds = searchParams.getAll('OfficeIds')
  const beginDate = searchParams.get('BeginDate')?.slice(0, 10)
  const endDate = searchParams.get('EndDate')?.slice(0, 10)

  let query = supabase
    .from('shifts')
    .select('id, date, schedule, personnel(id, name, title, type, hours_per_week), offices(id, name)')

  if (officeIds.length > 0) query = query.in('office_id', officeIds)
  if (beginDate) query = query.gte('date', beginDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error } = await query.order('date').returns<ShiftRow[]>()
  if (error) throw error

  const staff: StaffMember[] = (data ?? []).map((shift) => {
    const person = toArrayValue(shift.personnel)
    const office = toArrayValue(shift.offices)

    return {
      id: shift.id,
      name: person.name,
      title: person.title,
      type: person.type,
      hoursPerWeek: person.hours_per_week ?? undefined,
      schedule: shift.schedule,
      location: office.name,
      date: shift.date,
    }
  })

  const groups = new Map<StaffMember['type'], {
    personnelTypeId: string
    personnelTypeCategoryId: number
    personnelTypeName: string
    schedulePositionIndex: number
    scheduleGroupAlias: string
    items: unknown[]
  }>()

  for (const shift of data ?? []) {
    const person = toArrayValue(shift.personnel)
    const office = toArrayValue(shift.offices)
    const { beginTime, endTime } = parseSchedule(shift.schedule)

    if (!groups.has(person.type)) {
      groups.set(person.type, {
        personnelTypeId: person.type,
        personnelTypeCategoryId: getPersonnelCategory(person.type),
        personnelTypeName: getPersonnelLabel(person.type),
        schedulePositionIndex: getPersonnelCategory(person.type),
        scheduleGroupAlias: getPersonnelLabel(person.type),
        items: [],
      })
    }

    groups.get(person.type)?.items.push({
      appUserId: person.id,
      externalProviderId: null,
      externalProviderIdEhr: null,
      name: person.name,
      title: person.title,
      personnelId: person.id,
      secondaryPersonnelId: null,
      isDeletedUser: false,
      personnelTypeId: person.type,
      providerLicenseId: null,
      providerSpecialtyId: null,
      staffRoleId: null,
      shiftRequests: [
        {
          id: shift.id,
          beginDate: buildDateTime(shift.date, beginTime),
          endDate: buildDateTime(shift.date, endTime),
          office: {
            id: office.id,
            name: office.name,
          },
          schedule: shift.schedule,
        },
      ],
      unavailabilities: [],
    })
  }

  return {
    items: Array.from(groups.values()),
    mySchedule: [],
    demo: {
      staff,
    },
  }
}

export async function getRecommendationItems(searchParams: URLSearchParams) {
  const supabase = getSupabase()
  const officeId = searchParams.get('officeId')
  const evaluationDate = searchParams.get('evaluationTime')?.slice(0, 10)
  const beginDate = searchParams.get('BeginDate')?.slice(0, 10)
  const endDate = searchParams.get('EndDate')?.slice(0, 10)

  let query = supabase
    .from('recommendations')
    .select('id, role, need, slots, date, offices(id, name)')

  if (officeId) query = query.eq('office_id', officeId)
  if (evaluationDate) query = query.eq('date', evaluationDate)
  if (beginDate) query = query.gte('date', beginDate)
  if (endDate) query = query.lte('date', endDate)

  const { data, error } = await query.order('date').returns<RecommendationRow[]>()
  if (error) throw error

  return (data ?? []).map((recommendation): Recommendation & {
    officeId: string
    officeName: string
    recommendationRole: string
  } => {
    const office = toArrayValue(recommendation.offices)

    return {
      id: recommendation.id,
      role: recommendation.role,
      need: recommendation.need,
      slots: recommendation.slots,
      location: office.name,
      date: recommendation.date,
      officeId: office.id,
      officeName: office.name,
      recommendationRole: recommendation.role,
    }
  })
}

export async function getStaffAvailability(input: StaffAvailabilityInput) {
  const supabase = getSupabase()
  const dates = input.dates ?? []
  if (!input.officeId || dates.length === 0) return []

  const earliestBegin = dates
    .map((period) => period.beginDate)
    .sort()[0]
  const latestEnd = dates
    .map((period) => period.endDate)
    .sort()
    .at(-1)

  if (!earliestBegin || !latestEnd) return []

  const { data, error } = await supabase
    .from('staff_availability_ranges')
    .select('personnel_id, office_id, begin_date, end_date, personnel(id, name, title, type)')
    .eq('office_id', input.officeId)
    .lte('begin_date', latestEnd)
    .gte('end_date', earliestBegin)
    .order('begin_date')
    .returns<StaffAvailabilityRangeRow[]>()

  if (error) throw error

  const grouped = new Map<string, {
    userId: string
    personnelOfficeId: string
    name: string
    displayFullName: string
    speciality: string
    scheduleGroupAlias: string
    schedulePositionIndex: number
    personnelTypeCategoryId: number
    currentWeekScheduledHours: number
    availabilityRanges: Array<{ beginDate: string; endDate: string; duration: string }>
    isPrimary: boolean
    personnelId: string
  }>()

  for (const row of data ?? []) {
    const person = toArrayValue(row.personnel)
    if (!person?.id) continue

    if (!grouped.has(person.id)) {
      grouped.set(person.id, {
        userId: person.id,
        personnelOfficeId: person.id,
        name: person.name,
        displayFullName: person.name,
        speciality: person.title,
        scheduleGroupAlias: getPersonnelLabel(person.type),
        schedulePositionIndex: getPersonnelCategory(person.type),
        personnelTypeCategoryId: getPersonnelCategory(person.type),
        currentWeekScheduledHours: 0,
        availabilityRanges: [],
        isPrimary: true,
        personnelId: person.id,
      })
    }

    const durationMinutes = Math.max(
      (new Date(row.end_date).getTime() - new Date(row.begin_date).getTime()) / (1000 * 60),
      0
    )
    const record = grouped.get(person.id)!
    record.availabilityRanges.push({
      beginDate: row.begin_date,
      endDate: row.end_date,
      duration: `${durationMinutes}m`,
    })
  }

  return Array.from(grouped.values())
}

export async function getShiftCreationContext(options?: {
  officeNameOrId?: string
  date?: string
}) {
  const supabase = getSupabase()

  const [officesResult, personnelResult] = await Promise.all([
    supabase.from('offices').select('id, name').order('name').returns<OfficeOption[]>(),
    supabase
      .from('personnel')
      .select('id, name, title, type')
      .order('name')
      .returns<Array<Pick<PersonnelRow, 'id' | 'name' | 'title' | 'type'>>>(),
  ])

  if (officesResult.error) throw officesResult.error
  if (personnelResult.error) throw personnelResult.error

  const offices = officesResult.data ?? []
  const officeQuery = options?.officeNameOrId
  const selectedOffice =
    officeQuery
      ? offices.find((office) => office.id === officeQuery) ??
        offices.find((office) => normalizeText(office.name) === normalizeText(officeQuery))
      : null

  let availability: Awaited<ReturnType<typeof getStaffAvailability>> = []
  if (selectedOffice?.id && options?.date && isValidDate(options.date)) {
    availability = await getStaffAvailability({
      officeId: selectedOffice.id,
      dates: [dateToUtcDayPeriod(options.date)],
    })
  }

  return {
    offices,
    personnel: personnelResult.data ?? [],
    selectedOffice: selectedOffice ?? null,
    availability,
    scheduleFormat: 'h:mm AM - h:mm PM',
    dateFormat: 'YYYY-MM-DD',
  }
}

export type CreateShiftInput = {
  officeNameOrId: string
  staffNameOrId: string
  date: string
  schedule: string
}

export async function createShift(input: CreateShiftInput) {
  if (!isValidDate(input.date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.')
  }

  if (!isValidSchedule(input.schedule)) {
    throw new Error('Invalid schedule format. Use h:mm AM - h:mm PM.')
  }

  const supabase = getSupabase()
  const officesResult = await supabase
    .from('offices')
    .select('id, name')
    .order('name')
    .returns<OfficeOption[]>()

  if (officesResult.error) throw officesResult.error
  const offices = officesResult.data ?? []
  const normalizedOfficeInput = normalizeText(input.officeNameOrId)
  const officeById = offices.find((office) => office.id === input.officeNameOrId)
  const officeMatch =
    officeById ??
    offices.find((office) => normalizeText(office.name) === normalizedOfficeInput) ??
    null

  if (!officeMatch) {
    throw new Error(`Office not found for "${input.officeNameOrId}".`)
  }

  const personnelResult = await supabase
    .from('personnel')
    .select('id, name, title, type')
    .order('name')
    .returns<Array<Pick<PersonnelRow, 'id' | 'name' | 'title' | 'type'>>>()

  if (personnelResult.error) throw personnelResult.error
  const personnel = personnelResult.data ?? []
  const normalizedStaffInput = normalizeText(input.staffNameOrId)
  const personById = personnel.find((person) => person.id === input.staffNameOrId)
  const personMatch =
    personById ??
    personnel.find((person) => normalizeText(person.name) === normalizedStaffInput) ??
    null

  if (!personMatch) {
    throw new Error(`Staff member not found for "${input.staffNameOrId}".`)
  }

  const requestedRange = scheduleToRangeForDate(input.date, input.schedule)
  if (!requestedRange) {
    throw new Error('Could not parse schedule into a valid date range.')
  }

  const availability = await getStaffAvailability({
    officeId: officeMatch.id,
    dates: [dateToUtcDayPeriod(input.date)],
  })
  const memberAvailability = availability.find((item) => item.personnelId === personMatch.id)

  if (!memberAvailability) {
    throw new Error(
      `No availability found for "${personMatch.name}" on ${input.date} at "${officeMatch.name}".`
    )
  }

  const isInsideAvailability = memberAvailability.availabilityRanges.some((range) => {
    const start = new Date(range.beginDate).getTime()
    const end = new Date(range.endDate).getTime()
    const requestStart = new Date(requestedRange.beginDate).getTime()
    const requestEnd = new Date(requestedRange.endDate).getTime()
    return requestStart >= start && requestEnd <= end
  })

  if (!isInsideAvailability) {
    throw new Error(
      `Shift is outside availability for "${personMatch.name}". Available ranges: ${memberAvailability.availabilityRanges
        .map((range) => `${range.beginDate} -> ${range.endDate}`)
        .join(', ')}`
    )
  }

  const previousDate = getPreviousDate(input.date)
  const overlapCheck = await supabase
    .from('shifts')
    .select('id, date, schedule, office_id')
    .eq('personnel_id', personMatch.id)
    .in('date', [previousDate, input.date])

  if (overlapCheck.error) throw overlapCheck.error

  const conflictingShift = (overlapCheck.data ?? []).find((existingShift) => {
    const existingRange = scheduleToRangeForDate(existingShift.date, existingShift.schedule)
    if (!existingRange) return false
    return rangesOverlap(existingRange, requestedRange)
  })

  if (conflictingShift) {
    throw new Error(
      `Shift overlaps with an existing shift (${conflictingShift.date} ${conflictingShift.schedule}).`
    )
  }

  const duplicateCheck = await supabase
    .from('shifts')
    .select('id')
    .eq('office_id', officeMatch.id)
    .eq('personnel_id', personMatch.id)
    .eq('date', input.date)
    .eq('schedule', input.schedule)
    .limit(1)

  if (duplicateCheck.error) throw duplicateCheck.error
  if ((duplicateCheck.data ?? []).length > 0) {
    throw new Error('A shift with the same office, staff, date, and schedule already exists.')
  }

  const insertResult = await supabase
    .from('shifts')
    .insert({
      office_id: officeMatch.id,
      personnel_id: personMatch.id,
      date: input.date,
      schedule: input.schedule,
    })
    .select('id, date, schedule, office_id, personnel_id')
    .single<ShiftInsertRow>()

  if (insertResult.error) throw insertResult.error

  return {
    shiftId: insertResult.data.id,
    office: officeMatch,
    staff: personMatch,
    date: insertResult.data.date,
    schedule: insertResult.data.schedule,
  }
}

type ParsedShiftRequest = {
  officeQuery: string | null
  staffQuery: string | null
  date: string | null
  schedule: string | null
}

function parseShiftRequest(requestText: string): ParsedShiftRequest {
  const officeMatch = requestText.match(
    /(1st floor|2nd floor|3rd floor|first floor|second floor|third floor)/i
  )
  const dateMatch = requestText.match(/\b(\d{4}-\d{2}-\d{2})\b/)
  const scheduleMatch = requestText.match(
    /(\d{1,2}:\d{2}\s(?:AM|PM)\s-\s\d{1,2}:\d{2}\s(?:AM|PM))/i
  )
  const staffMatch =
    requestText.match(/for\s+([A-Za-zÀ-ÿ'.,\-\s]+?)(?:\s+on\s+|\s+at\s+\d|\s+from\s+\d|$)/i) ??
    requestText.match(/para\s+([A-Za-zÀ-ÿ'.,\-\s]+?)(?:\s+el\s+\d|\s+a\s+las|\s+de\s+\d|$)/i)

  const officeText = officeMatch?.[1]?.toLowerCase() ?? null
  const officeQuery =
    officeText === 'first floor'
      ? '1st Floor'
      : officeText === 'second floor'
        ? '2nd Floor'
        : officeText === 'third floor'
          ? '3rd Floor'
          : officeMatch?.[1] ?? null

  return {
    officeQuery,
    staffQuery: staffMatch?.[1]?.trim() ?? null,
    date: dateMatch?.[1] ?? null,
    schedule: scheduleMatch?.[1] ?? null,
  }
}

export function analyzeShiftRequest(requestText: string) {
  const parsed = parseShiftRequest(requestText)
  const normalizedText = normalizeText(requestText)
  const asksToCreateShift =
    /(create|add|new|assign|schedule|crear|agregar|asignar|programar)/.test(normalizedText) &&
    /(shift|turno)/.test(normalizedText)

  const missingFields: string[] = []
  if (!parsed.officeQuery) missingFields.push('officeNameOrId')
  if (!parsed.staffQuery) missingFields.push('staffNameOrId')
  if (!parsed.date) missingFields.push('date')
  if (!parsed.schedule) missingFields.push('schedule')

  return {
    intent: asksToCreateShift ? 'create_shift' : 'none',
    parsed,
    missingFields,
  }
}

export async function createShiftFromRequest(requestText: string) {
  const parsed = parseShiftRequest(requestText)
  const context = await getShiftCreationContext({
    officeNameOrId: parsed.officeQuery ?? undefined,
    date: parsed.date ?? undefined,
  })
  const missing: string[] = []

  if (!parsed.officeQuery) missing.push('office (e.g., 2nd Floor)')
  if (!parsed.staffQuery) missing.push('staff name (e.g., Martinez, Sofia)')
  if (!parsed.date) missing.push('date in YYYY-MM-DD format')
  if (!parsed.schedule) missing.push('schedule in h:mm AM - h:mm PM format')

  if (missing.length > 0) {
    return {
      ok: false,
      reason: `Missing required data: ${missing.join(', ')}.`,
      parsed,
      suggestions: context,
    }
  }

  const officeQuery = parsed.officeQuery as string
  const staffQuery = parsed.staffQuery as string
  const date = parsed.date as string
  const schedule = parsed.schedule as string

  const officeMatch = pickBestMatch(context.offices, (office) => office.name, officeQuery)
  const staffMatch = pickBestMatch(context.personnel, (person) => person.name, staffQuery)

  if (!officeMatch.selected || !staffMatch.selected) {
    return {
      ok: false,
      reason: 'Could not resolve office or staff unambiguously.',
      parsed,
      officeCandidates: officeMatch.candidates.slice(0, 5),
      staffCandidates: staffMatch.candidates.slice(0, 5),
    }
  }

  const createdShift = await createShift({
    officeNameOrId: officeMatch.selected.id,
    staffNameOrId: staffMatch.selected.id,
    date,
    schedule,
  })

  const requestedRange = scheduleToRangeForDate(date, schedule)
  const memberAvailability = context.availability.find(
    (item) => item.personnelId === createdShift.staff.id
  )

  const isInsideAvailability =
    requestedRange && memberAvailability
      ? memberAvailability.availabilityRanges.some((range) => {
          const start = new Date(range.beginDate).getTime()
          const end = new Date(range.endDate).getTime()
          const requestStart = new Date(requestedRange.beginDate).getTime()
          const requestEnd = new Date(requestedRange.endDate).getTime()
          return requestStart >= start && requestEnd <= end
        })
      : false

  return {
    ok: true,
    parsed,
    availabilityCheck: {
      checked: Boolean(memberAvailability),
      isInsideAvailability,
      memberAvailability: memberAvailability?.availabilityRanges ?? [],
    },
    createdShift,
  }
}
