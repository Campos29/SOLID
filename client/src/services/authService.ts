import { api } from '../lib/api'
import type { AuthTokens, LoginPayload, RegisterPayload } from '../types/auth'

// Thin wrappers around the backend auth endpoints. Keeping the HTTP calls in
// one place lets the pages and context stay agnostic of Axios specifics.
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
