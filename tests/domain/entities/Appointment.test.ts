import { describe, expect, it } from 'vitest';
import { Appointment } from '../../../src/domain/entities/Appointment';

describe('Appointment entity', () => {
  it('creates a pending appointment with normalized notes', () => {
    const createdAt = new Date('2026-06-05T20:12:00.000Z');
    const startsAt = new Date('2026-06-10T12:00:00.000Z');
    const endsAt = new Date('2026-06-10T12:30:00.000Z');

    const appointment = Appointment.create({
      id: 'appointment-1',
      providerId: 'provider-1',
      clientId: 'client-1',
      serviceId: 'service-1',
      startsAt,
      endsAt,
      notes: ' Cliente prefere cadeira perto da janela ',
      createdAt,
    });

    expect(appointment.id).toBe('appointment-1');
    expect(appointment.providerId).toBe('provider-1');
    expect(appointment.clientId).toBe('client-1');
    expect(appointment.serviceId).toBe('service-1');
    expect(appointment.startsAt).toEqual(startsAt);
    expect(appointment.endsAt).toEqual(endsAt);
    expect(appointment.status).toBe('pending');
    expect(appointment.notes).toBe('Cliente prefere cadeira perto da janela');
    expect(appointment.createdAt).toEqual(createdAt);
    expect(appointment.updatedAt).toEqual(createdAt);
  });

  it('confirms a pending appointment', () => {
    const updatedAt = new Date('2026-06-05T21:00:00.000Z');
    const appointment = makeAppointment();

    const confirmedAppointment = appointment.confirm(updatedAt);

    expect(confirmedAppointment.status).toBe('confirmed');
    expect(confirmedAppointment.updatedAt).toEqual(updatedAt);
    expect(appointment.status).toBe('pending');
  });

  it('cancels a confirmed appointment', () => {
    const cancelledAt = new Date('2026-06-05T21:30:00.000Z');
    const confirmedAppointment = makeAppointment().confirm();

    const cancelledAppointment = confirmedAppointment.cancel(cancelledAt);

    expect(cancelledAppointment.status).toBe('cancelled');
    expect(cancelledAppointment.updatedAt).toEqual(cancelledAt);
  });

  it('rejects an appointment with an invalid time range', () => {
    expect(() =>
      makeAppointment({
        startsAt: new Date('2026-06-10T12:30:00.000Z'),
        endsAt: new Date('2026-06-10T12:00:00.000Z'),
      }),
    ).toThrow('Appointment end time must be after start time');
  });

  it('rejects an invalid status transition', () => {
    const completedAppointment = makeAppointment().confirm().complete();

    expect(() => completedAppointment.cancel()).toThrow(
      'Cannot transition appointment from completed to cancelled',
    );
  });
});

function makeAppointment(overrides: Partial<Parameters<typeof Appointment.create>[0]> = {}) {
  return Appointment.create({
    id: 'appointment-1',
    providerId: 'provider-1',
    clientId: 'client-1',
    serviceId: 'service-1',
    startsAt: new Date('2026-06-10T12:00:00.000Z'),
    endsAt: new Date('2026-06-10T12:30:00.000Z'),
    ...overrides,
  });
}
