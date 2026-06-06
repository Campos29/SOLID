import { describe, expect, it } from 'vitest';
import { Availability } from '../../../src/domain/entities/Availability';

describe('Availability entity', () => {
  it('creates a weekly availability with blocked dates', () => {
    const createdAt = new Date('2026-06-04T20:18:00.000Z');
    const vacationDate = new Date('2026-06-12T00:00:00.000Z');

    const availability = Availability.create({
      id: 'availability-1',
      providerId: 'provider-1',
      weeklySlots: [
        {
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '18:00',
          slotIntervalInMinutes: 30,
        },
      ],
      blockedDates: [{ date: vacationDate, reason: 'Ferias' }],
      createdAt,
    });

    expect(availability.id).toBe('availability-1');
    expect(availability.providerId).toBe('provider-1');
    expect(availability.weeklySlots).toEqual([
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        slotIntervalInMinutes: 30,
      },
    ]);
    expect(availability.blockedDates).toEqual([{ date: vacationDate, reason: 'Ferias' }]);
    expect(availability.createdAt).toBe(createdAt);
  });

  it('rejects an availability without weekly slots', () => {
    expect(() =>
      Availability.create({
        id: 'availability-1',
        providerId: 'provider-1',
        weeklySlots: [],
      }),
    ).toThrow('Availability weekly slots are required');
  });

  it('rejects overlapping weekly slots for the same day', () => {
    expect(() =>
      Availability.create({
        id: 'availability-1',
        providerId: 'provider-1',
        weeklySlots: [
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '12:00',
            slotIntervalInMinutes: 30,
          },
          {
            dayOfWeek: 1,
            startTime: '11:00',
            endTime: '18:00',
            slotIntervalInMinutes: 30,
          },
        ],
      }),
    ).toThrow('Availability weekly slots cannot overlap');
  });

  it('rejects a slot interval that does not fit the time range', () => {
    expect(() =>
      Availability.create({
        id: 'availability-1',
        providerId: 'provider-1',
        weeklySlots: [
          {
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '09:20',
            slotIntervalInMinutes: 30,
          },
        ],
      }),
    ).toThrow('Availability slot interval must fit the time range');
  });
});
