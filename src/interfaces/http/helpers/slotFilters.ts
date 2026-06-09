import { WeeklyAvailabilitySlot } from '../../../domain/entities/Availability';

type TimeSlot = { startsAt: Date; endsAt: Date };

export function filterSlotsForServiceDuration(
  slots: TimeSlot[],
  durationInMinutes: number,
  daySlot: WeeklyAvailabilitySlot,
  date: Date,
): TimeSlot[] {
  const dayEnd = buildDateTime(date, toMinutes(daySlot.endTime));

  return slots.filter((slot) => {
    const serviceEnd = new Date(slot.startsAt.getTime() + durationInMinutes * 60_000);
    return serviceEnd <= dayEnd;
  });
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function buildDateTime(date: Date, totalMinutes: number): Date {
  const result = new Date(date);
  result.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
  return result;
}
