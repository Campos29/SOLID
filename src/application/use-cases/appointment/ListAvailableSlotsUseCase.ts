import { Availability, WeeklyAvailabilitySlot } from '@domain/entities/Availability';
import { IAvailabilityRepository } from '@domain/interfaces/IAvailabilityRepository';
import { IAppointmentReader } from '@domain/interfaces/IAppointmentRepository';

export interface ListAvailableSlotsInput {
  providerId: string;
  date: Date;
}

type TimeSlot = { startsAt: Date; endsAt: Date };

export interface ListAvailableSlotsOutput {
  slots: TimeSlot[];
}

export class ListAvailableSlotsUseCase {
  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly appointmentReader: IAppointmentReader,
  ) {}

  async execute(input: ListAvailableSlotsInput): Promise<ListAvailableSlotsOutput> {
    const availability = await this.availabilityRepository.findByProviderId(input.providerId);
    if (!availability) {
      return { slots: [] };
    }

    const daySlot = findDaySlot(availability, input.date.getDay());
    if (!daySlot || isDateBlocked(availability, input.date)) {
      return { slots: [] };
    }

    const generated = generateTimeSlots(input.date, daySlot);
    if (generated.length === 0) {
      return { slots: [] };
    }

    const booked = await this.appointmentReader.findOverlappingActiveByProvider(
      input.providerId,
      generated[0].startsAt,
      generated[generated.length - 1].endsAt,
    );

    return { slots: generated.filter(slot => !slotOverlapsAny(slot, booked)) };
  }
}

function findDaySlot(availability: Availability, dayOfWeek: number): WeeklyAvailabilitySlot | undefined {
  return availability.weeklySlots.find(s => s.dayOfWeek === dayOfWeek);
}

function isDateBlocked(availability: Availability, date: Date): boolean {
  return availability.blockedDates.some(blocked => isSameCalendarDay(blocked.date, date));
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function generateTimeSlots(date: Date, slot: WeeklyAvailabilitySlot): TimeSlot[] {
  const result: TimeSlot[] = [];
  const startMinutes = timeToMinutes(slot.startTime);
  const endMinutes = timeToMinutes(slot.endTime);

  for (let m = startMinutes; m + slot.slotIntervalInMinutes <= endMinutes; m += slot.slotIntervalInMinutes) {
    result.push({
      startsAt: buildDateTime(date, m),
      endsAt: buildDateTime(date, m + slot.slotIntervalInMinutes),
    });
  }

  return result;
}

function timeToMinutes(time: string): number {
  const [hoursStr, minutesStr] = time.split(':');
  return parseInt(hoursStr, 10) * 60 + parseInt(minutesStr, 10);
}

function buildDateTime(date: Date, totalMinutes: number): Date {
  const result = new Date(date);
  result.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return result;
}

function slotOverlapsAny(slot: TimeSlot, appointments: TimeSlot[]): boolean {
  return appointments.some(a => a.startsAt < slot.endsAt && slot.startsAt < a.endsAt);
}
