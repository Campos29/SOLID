export class ReviewAlreadyExistsError extends Error {
  constructor() {
    super('A review already exists for this appointment');
    this.name = 'ReviewAlreadyExistsError';
  }
}
