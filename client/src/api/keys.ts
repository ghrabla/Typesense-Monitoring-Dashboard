import { apiFetch } from './client'

export interface Key {
  id: number
  actions: string[]
  collections: string[]
  description: string
  expires_at?: number
  value?: string
  value_prefix?: string
}

export interface CreateKeyRequest {
  actions: string[]
  collections: string[]
  description: string
  expires_at?: number
}

export function listKeys() {
  return apiFetch<Key[]>('/keys')
}

export function getKey(id: number) {
  return apiFetch<Key>(`/keys/${id}`)
}

export function createKey(payload: CreateKeyRequest) {
  return apiFetch<Key>('/keys', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteKey(id: number) {
  return apiFetch<{ message: string }>(`/keys/${id}`, { method: 'DELETE' })
}
