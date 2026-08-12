const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    clearToken()
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.error ?? 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

/**
 * For endpoints that stream a non-JSON body (e.g. NDJSON export) and require
 * the Authorization header, which rules out a plain <a href> download link.
 */
export async function apiFetchBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    clearToken()
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new ApiError(response.status, body || 'Request failed')
  }

  return response.blob()
}
