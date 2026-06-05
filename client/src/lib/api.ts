import axios from 'axios'

const STORAGE_KEY = 'slotwise.accessToken'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL })

// Attach the persisted access token to every outgoing request so that
// authenticated calls keep working after a page reload.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(STORAGE_KEY, token)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Normalises the Fastify error envelope ({ statusCode, error, message })
// into a plain message the UI can render directly.
export function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Tente novamente.'
    }
  }
  return fallback
}
