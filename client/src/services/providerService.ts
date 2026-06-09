import { api } from '../lib/api'
import type { Provider } from '../types/scheduling'

interface ListProvidersResponse {
  providers: Provider[]
}

// Wraps the public provider catalogue endpoint. The optional category filter
// maps to the `?category=` query string accepted by GET /providers.
export const providerService = {
  async list(category?: string): Promise<Provider[]> {
    const params = category?.trim() ? { category: category.trim() } : undefined
    const { data } = await api.get<ListProvidersResponse>('/providers', { params })
    return data.providers
  },

  // Resolves the provider profile owned by the authenticated user. The backend
  // has no dedicated "my provider" endpoint yet, so we match by userId.
  async findByUserId(userId: string): Promise<Provider | null> {
    const { data } = await api.get<ListProvidersResponse>('/providers')
    return data.providers.find((provider) => provider.userId === userId) ?? null
  },

  async create(payload: {
    name: string
    description?: string
    category: string
  }): Promise<Provider> {
    const { data } = await api.post<Provider>('/providers', payload)
    return data
  },

  async update(
    providerId: string,
    payload: { name: string; description?: string; category: string },
  ): Promise<Provider> {
    const { data } = await api.put<Provider>(`/providers/${providerId}`, payload)
    return data
  },
}
