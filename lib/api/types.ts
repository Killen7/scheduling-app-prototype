export type PersonnelType = 'provider' | 'clinical' | 'non-clinical'

export interface Personnel {
  id: string
  name: string
  personnel_type: PersonnelType
  title?: string | null
  hours_per_week?: number | null
  created_at: string
}

export interface Office {
  id: string
  name: string
  created_at: string
}

export interface PersonnelOffice {
  id: string
  personnel_id: string
  office_id: string
  created_at: string
  personnel?: Personnel
  office?: Office
}

export interface Shift {
  id: string
  personnel_office_id: string
  start_at: string
  end_at: string
  created_at: string
  personnel_office?: PersonnelOffice
  tags?: Tag[]
  shift_tasks?: (ShiftTask & { task: Task })[]
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface Task {
  id: string
  name: string
  is_provider_attached: boolean
  created_at: string
}

export interface ShiftTag {
  id: string
  shift_id: string
  tag_id: string
  created_at: string
}

export interface ShiftTask {
  id: string
  shift_id: string
  task_id: string
  provider_shift_id: string | null
  created_at: string
}

export interface Pto {
  id: string
  personnel_id: string
  name: string
  reason: string | null
  start_at: string
  end_at: string
  created_at: string
  personnel?: Personnel
}

export interface PaginatedResult<T> {
  totalCount: number
  items: T[]
}

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
