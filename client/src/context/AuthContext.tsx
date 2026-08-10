import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiFetch, clearToken, getToken, setToken } from '../api/client'

interface LoginResponse {
  token: string
  expires_at: number
  username: string
}

interface AuthContextValue {
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function decodeTokenPayload(token: string): { sub?: string; exp?: number } | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeTokenPayload(token)
  return !payload?.exp || payload.exp * 1000 < Date.now()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token && !isTokenExpired(token)) {
      setUsername(decodeTokenPayload(token)?.sub ?? null)
    } else {
      clearToken()
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (usernameInput: string, password: string) => {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: usernameInput, password }),
    })
    setToken(data.token)
    setUsername(data.username)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      clearToken()
      setUsername(null)
    }
  }, [])

  const value = useMemo(
    () => ({ username, isAuthenticated: username !== null, isLoading, login, logout }),
    [username, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
