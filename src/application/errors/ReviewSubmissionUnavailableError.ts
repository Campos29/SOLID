export class ReviewSubmissionUnavailableError extends Error {
  constructor() {
    super('Review submission use case is not available yet');
    this.name = 'ReviewSubmissionUnavailableError';
  }
}
