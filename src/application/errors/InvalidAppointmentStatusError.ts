export class InvalidAppointmentStatusError extends Error {
  constructor(message = 'Appointment cannot change to the requested status') {
    super(message);
    this.name = 'InvalidAppointmentStatusError';
  }
}
