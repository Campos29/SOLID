export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type WeeklyAvailabilitySlot = {
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  slotIntervalInMinutes: number;
};

export type BlockedDate = {
  date: Date;
  reason?: string;
};

export type AvailabilityProps = {
  id: string;
  providerId: string;
  weeklySlots: WeeklyAvailabilitySlot[];
  blockedDates: BlockedDate[];
  createdAt: Date;
};

export type CreateAvailabilityInput = {
  id: string;
  providerId: string;
  weeklySlots: WeeklyAvailabilitySlot[];
  blockedDates?: BlockedDate[];
  createdAt?: Date;
};

export class Availability {
  private constructor(private readonly props: AvailabilityProps) {}

  static create(input: CreateAvailabilityInput): Availability {
    ensureFilled(input.id, 'Availability id');
    ensureFilled(input.providerId, 'Availability provider id');
    ensureWeeklySlots(input.weeklySlots);
    ensureBlockedDates(input.blockedDates ?? []);

    return new Availability({
      ...input,
      weeklySlots: input.weeklySlots.map(copyWeeklySlot),
      blockedDates: (input.blockedDates ?? []).map(copyBlockedDate),
      createdAt: input.createdAt ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get providerId(): string {
    return this.props.providerId;
  }

  get weeklySlots(): WeeklyAvailabilitySlot[] {
    return this.props.weeklySlots.map(copyWeeklySlot);
  }

  get blockedDates(): BlockedDate[] {
    return this.props.blockedDates.map(copyBlockedDate);
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

function ensureFilled(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required`);
  }
}

function ensureWeeklySlots(slots: WeeklyAvailabilitySlot[]): void {
  if (slots.length === 0) {
    throw new Error('Availability weekly slots are required');
  }

  slots.forEach(ensureWeeklySlot);
  ensureNoOverlaps(slots);
}

function ensureWeeklySlot(slot: WeeklyAvailabilitySlot): void {
  ensureWeekDay(slot.dayOfWeek);
  ensureTimeRange(slot.startTime, slot.endTime);
  ensurePositiveInteger(slot.slotIntervalInMinutes, 'Availability slot interval');
  ensureSlotIntervalFits(slot);
}

function ensureWeekDay(dayOfWeek: number): void {
  if (!WEEK_DAYS.includes(dayOfWeek as WeekDay)) {
    throw new Error('Availability day of week is invalid');
  }
}

function ensureTimeRange(startTime: string, endTime: string): void {
  if (toMinutes(startTime) >= toMinutes(endTime)) {
    throw new Error('Availability end time must be after start time');
  }
}

function ensurePositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
}

function ensureSlotIntervalFits(slot: WeeklyAvailabilitySlot): void {
  const duration = toMinutes(slot.endTime) - toMinutes(slot.startTime);

  if (duration < slot.slotIntervalInMinutes || duration % slot.slotIntervalInMinutes !== 0) {
    throw new Error('Availability slot interval must fit the time range');
  }
}

function ensureBlockedDates(blockedDates: BlockedDate[]): void {
  blockedDates.forEach((blockedDate) => {
    if (Number.isNaN(blockedDate.date.getTime())) {
      throw new Error('Availability blocked date is invalid');
    }
  });
}

function ensureNoOverlaps(slots: WeeklyAvailabilitySlot[]): void {
  slots.forEach((slot, index) => {
    const hasOverlap = slots.some((other, otherIndex) => {
      return index !== otherIndex && overlaps(slot, other);
    });

    if (hasOverlap) {
      throw new Error('Availability weekly slots cannot overlap');
    }
  });
}

function overlaps(first: WeeklyAvailabilitySlot, second: WeeklyAvailabilitySlot): boolean {
  if (first.dayOfWeek !== second.dayOfWeek) {
    return false;
  }

  return toMinutes(first.startTime) < toMinutes(second.endTime)
    && toMinutes(second.startTime) < toMinutes(first.endTime);
}

function toMinutes(time: string): number {
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('Availability time must use HH:mm format');
  }

  const [hours, minutes] = time.split(':').map(Number);
  ensureClockTime(hours, minutes);
  return hours * 60 + minutes;
}

function ensureClockTime(hours: number, minutes: number): void {
  if (hours > 23 || minutes > 59) {
    throw new Error('Availability time is invalid');
  }
}

function copyWeeklySlot(slot: WeeklyAvailabilitySlot): WeeklyAvailabilitySlot {
  return { ...slot };
}

function copyBlockedDate(blockedDate: BlockedDate): BlockedDate {
  return {
    ...blockedDate,
    date: new Date(blockedDate.date),
  };
}
