import { api } from '../lib/api'
import type { AuthTokens, LoginPayload, RegisterPayload } from '../types/auth'



export const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/register', payload)
    return data
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<AuthTokens>('/auth/login', payload)
    return data
  },
}
