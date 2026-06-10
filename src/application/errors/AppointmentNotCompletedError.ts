export class AppointmentNotCompletedError extends Error {
  constructor() {
    super('Reviews can only be submitted for completed appointments');
    this.name = 'AppointmentNotCompletedError';
  }
}
