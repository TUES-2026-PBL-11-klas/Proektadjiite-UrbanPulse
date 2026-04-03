'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiPost } from '@/lib/api'
import { type User, type UserLevel } from '@/lib/mock-data'

const TOKEN_KEY = 'urbanpulse_token'
const USER_KEY = 'urbanpulse_user'

interface BackendUser {
  id: string
  email: string
  display_name: string
  role: 'citizen' | 'admin'
  points: number
  level: number
  created_at?: string
}

interface AuthResponse {
  token: string
  user: BackendUser
}

interface AuthState {
  user: User | null
  token: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => void
  updateUser: (user: User, token: string) => void
  isLoading: boolean
}

function mapUser(b: BackendUser): User {
  return {
    id: b.id,
    email: b.email,
    displayName: b.display_name,
    role: b.role,
    points: b.points,
    level: b.level as UserLevel,
    createdAt: b.created_at ?? new Date().toISOString(),
  }
}

function parseJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ?? null
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const userJson = localStorage.getItem(USER_KEY)
    if (token && userJson) {
      const exp = parseJwtExp(token)
      if (exp && exp * 1000 > Date.now()) {
        try {
          const user = JSON.parse(userJson) as User
          setState({ user, token })
        } catch {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
        }
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  function persist(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setState({ user, token })
  }

  async function login(email: string, password: string) {
    const { token, user } = await apiPost<AuthResponse>('/api/auth/login', { email, password })
    persist(token, mapUser(user))
  }

  async function register(email: string, password: string, displayName: string) {
    const { token, user } = await apiPost<AuthResponse>('/api/auth/register', {
      email,
      password,
      display_name: displayName,
    })
    persist(token, mapUser(user))
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setState({ user: null, token: null })
  }

  function updateUser(user: User, token: string) {
    persist(token, user)
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
