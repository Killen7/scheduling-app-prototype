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

export type OfficeOption = {
  id: string
  name: string
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
