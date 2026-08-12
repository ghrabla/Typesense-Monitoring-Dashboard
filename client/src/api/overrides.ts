import { apiFetch } from './client'

export interface OverrideInclude {
  id: string
  position: number
}

export interface OverrideExclude {
  id: string
}

export interface OverrideRule {
  query: string
  match: string
  tags?: string[]
}

export interface Override {
  id: string
  rule: OverrideRule
  includes?: OverrideInclude[]
  excludes?: OverrideExclude[]
  filter_by?: string
  remove_matched_tokens?: boolean
}

export interface UpsertOverrideRequest {
  rule: OverrideRule
  includes?: OverrideInclude[]
  excludes?: OverrideExclude[]
  filter_by?: string
  remove_matched_tokens?: boolean
}

export function listOverrides(collection: string) {
  return apiFetch<Override[]>(`/collections/${encodeURIComponent(collection)}/overrides`)
}

export function getOverride(collection: string, id: string) {
  return apiFetch<Override>(
    `/collections/${encodeURIComponent(collection)}/overrides/${encodeURIComponent(id)}`,
  )
}

export function upsertOverride(collection: string, id: string, payload: UpsertOverrideRequest) {
  return apiFetch<Override>(
    `/collections/${encodeURIComponent(collection)}/overrides/${encodeURIComponent(id)}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  )
}

export function deleteOverride(collection: string, id: string) {
  return apiFetch<{ message: string }>(
    `/collections/${encodeURIComponent(collection)}/overrides/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
}
