export class ProviderAlreadyExistsError extends Error {
  constructor(userId: string) {
    super(`User "${userId}" already has a provider profile`);
    this.name = 'ProviderAlreadyExistsError';
  }
}
