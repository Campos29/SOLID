import { createContext, use } from 'react'
import type { AuthTokens, AuthUser, LoginPayload, RegisterPayload } from '../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<AuthTokens>
  register: (payload: RegisterPayload) => Promise<AuthTokens>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
