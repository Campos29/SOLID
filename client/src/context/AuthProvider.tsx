import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../services/authService'
import { setAccessToken } from '../lib/api'
import type { AuthTokens, AuthUser, LoginPayload, RegisterPayload } from '../types/auth'
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'

const USER_STORAGE_KEY = 'slotwise.user'

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  const persistSession = useCallback((tokens: AuthTokens) => {
    setAccessToken(tokens.accessToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tokens.user))
    setUser(tokens.user)
  }, [])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await authService.login(payload)
      persistSession(tokens)
      return tokens
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const tokens = await authService.register(payload)
      persistSession(tokens)
      return tokens
    },
    [persistSession],
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
