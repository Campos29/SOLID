export class SlotAlreadyBookedError extends Error {
  constructor() {
    super('The requested time slot is already booked');
    this.name = 'SlotAlreadyBookedError';
  }
}
