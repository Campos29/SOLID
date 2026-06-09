// Mirrors the Availability domain entity (src/domain/entities/Availability.ts).
// dayOfWeek follows JS getDay(): 0 = Sunday ... 6 = Saturday.
export interface WeeklyAvailabilitySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotIntervalInMinutes: number
}

export interface BlockedDate {
  date: string
  reason: string
}

export interface Availability {
  id: string
  providerId: string
  weeklySlots: WeeklyAvailabilitySlot[]
  blockedDates: BlockedDate[]
  createdAt: string
}

export interface ConfigureAvailabilityPayload {
  weeklySlots: WeeklyAvailabilitySlot[]
  blockedDates: BlockedDate[]
}

export const WEEK_DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
]
