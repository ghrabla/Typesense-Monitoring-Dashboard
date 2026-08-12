import { apiFetch } from './client'

export interface Alias {
  name: string
  collection_name: string
}

export interface UpsertAliasRequest {
  collection_name: string
}

export function listAliases() {
  return apiFetch<Alias[]>('/aliases')
}

export function getAlias(name: string) {
  return apiFetch<Alias>(`/aliases/${encodeURIComponent(name)}`)
}

export function upsertAlias(name: string, payload: UpsertAliasRequest) {
  return apiFetch<Alias>(`/aliases/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteAlias(name: string) {
  return apiFetch<{ message: string }>(`/aliases/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
}
