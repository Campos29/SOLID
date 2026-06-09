import { api } from '../lib/api'
import type { Service } from '../types/scheduling'

export interface CreateServicePayload {
  name: string
  durationInMinutes: number
  priceInCents: number
}

export const serviceService = {
  async listByProvider(providerId: string): Promise<Service[]> {
    const { data } = await api.get<{ services: Service[] }>(
      `/providers/${providerId}/services`,
    )
    return data.services
  },

  async create(providerId: string, payload: CreateServicePayload): Promise<Service> {
    const { data } = await api.post<Service>(`/providers/${providerId}/services`, payload)
    return data
  },

  async update(
    providerId: string,
    serviceId: string,
    payload: CreateServicePayload,
  ): Promise<Service> {
    const { data } = await api.patch<Service>(
      `/providers/${providerId}/services/${serviceId}`,
      payload,
    )
    return data
  },

  async remove(providerId: string, serviceId: string): Promise<void> {
    await api.delete(`/providers/${providerId}/services/${serviceId}`)
  },
}
