// Mirrors the roles accepted by the backend (see src/domain/entities/User.ts).
// 'Admin' is managed internally and is not offered on the public sign-up form.
export const USER_ROLES = ['Provider', 'Client'] as const

export type UserRole = (typeof USER_ROLES)[number]

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole | 'Admin'
  createdAt: string
}

export interface AuthTokens {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface LoginPayload {
  email: string
  password: string
}
