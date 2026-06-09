export class ProviderNotFoundError extends Error {
  constructor() {
    super('Provider not found');
    this.name = 'ProviderNotFoundError';
  }
}
