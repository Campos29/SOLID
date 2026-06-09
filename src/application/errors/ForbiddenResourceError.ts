export class ForbiddenResourceError extends Error {
  constructor() {
    super('You do not have permission to access this resource');
    this.name = 'ForbiddenResourceError';
  }
}
