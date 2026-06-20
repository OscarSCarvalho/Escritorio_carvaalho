import { User } from '@/types'

const TOKEN_KEY = 'evf_auth_token'
const USER_KEY = 'evf_user'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export const setUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const isAuthenticated = (): boolean => !!getToken()
