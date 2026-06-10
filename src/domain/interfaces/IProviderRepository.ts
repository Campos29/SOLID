import { Provider } from '../entities/Provider';

export interface IProviderRepository {
  save(provider: Provider): Promise<void>;
  findById(id: string): Promise<Provider | null>;
  findByUserId(userId: string): Promise<Provider | null>;
  findByCategory(category: string): Promise<Provider[]>;
  findAll(filters?: { category?: string }): Promise<Provider[]>;
  updateAverageRating(providerId: string, average: number): Promise<void>;
}
