import { api } from '../lib/api'
import type { Provider } from '../types/scheduling'

interface ListProvidersResponse {
  providers: Provider[]
}



export const providerService = {
  async list(category?: string): Promise<Provider[]> {
    const params = category?.trim() ? { category: category.trim() } : undefined
    const { data } = await api.get<ListProvidersResponse>('/providers', { params })
    return data.providers
  },



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
