import { apiFetch } from './client'

export interface Synonym {
  id: string
  root?: string
  synonyms: string[]
}

export interface UpsertSynonymRequest {
  root?: string
  synonyms: string[]
}

export function listSynonyms(collection: string) {
  return apiFetch<Synonym[]>(`/collections/${encodeURIComponent(collection)}/synonyms`)
}

export function getSynonym(collection: string, id: string) {
  return apiFetch<Synonym>(
    `/collections/${encodeURIComponent(collection)}/synonyms/${encodeURIComponent(id)}`,
  )
}

export function upsertSynonym(collection: string, id: string, payload: UpsertSynonymRequest) {
  return apiFetch<Synonym>(
    `/collections/${encodeURIComponent(collection)}/synonyms/${encodeURIComponent(id)}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  )
}

export function deleteSynonym(collection: string, id: string) {
  return apiFetch<{ message: string }>(
    `/collections/${encodeURIComponent(collection)}/synonyms/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
}
