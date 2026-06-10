export class UnauthorizedReviewError extends Error {
  constructor() {
    super('You are not allowed to review this appointment');
    this.name = 'UnauthorizedReviewError';
  }
}
