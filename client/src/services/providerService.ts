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
}
