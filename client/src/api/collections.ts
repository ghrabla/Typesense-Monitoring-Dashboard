import { apiFetch } from './client'

export interface CollectionField {
  name: string
  type: string
  facet?: boolean
  optional?: boolean
  index?: boolean
  sort?: boolean
  infix?: boolean
  locale?: string
  num_dim?: number
}

export interface Collection {
  name: string
  num_documents: number
  fields: CollectionField[]
  default_sorting_field?: string
  created_at?: number
}

export interface CollectionSummary {
  name: string
  num_documents: number
  num_fields: number
}

export interface CreateCollectionRequest {
  name: string
  fields: CollectionField[]
  default_sorting_field?: string
}

export interface UpdateCollectionRequest {
  fields: CollectionField[]
}

export function listCollections() {
  return apiFetch<CollectionSummary[]>('/collections')
}

export function getCollection(name: string) {
  return apiFetch<Collection>(`/collections/${encodeURIComponent(name)}`)
}

export function createCollection(payload: CreateCollectionRequest) {
  return apiFetch<Collection>('/collections', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCollection(name: string, payload: UpdateCollectionRequest) {
  return apiFetch<Collection>(`/collections/${encodeURIComponent(name)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteCollection(name: string) {
  return apiFetch<{ message: string; name: string }>(`/collections/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
}
