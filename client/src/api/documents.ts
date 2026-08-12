import { apiFetch, apiFetchBlob } from './client'

export type DocumentRecord = Record<string, unknown>

export interface SearchHit {
  document: DocumentRecord
  highlight?: Record<string, unknown>
}

export interface SearchResponse {
  found: number
  out_of: number
  page?: number
  search_time_ms: number
  hits: SearchHit[]
  facet_counts?: Record<string, unknown>[]
}

export interface SearchParams {
  q?: string
  queryBy?: string
  filterBy?: string
  sortBy?: string
  page?: number
  perPage?: number
}

function buildSearchQuery(params: SearchParams): string {
  const query = new URLSearchParams()
  query.set('q', params.q?.trim() || '*')
  if (params.queryBy) query.set('query_by', params.queryBy)
  if (params.filterBy) query.set('filter_by', params.filterBy)
  if (params.sortBy) query.set('sort_by', params.sortBy)
  query.set('page', String(params.page ?? 1))
  query.set('per_page', String(params.perPage ?? 10))
  return query.toString()
}

export function searchDocuments(collection: string, params: SearchParams) {
  return apiFetch<SearchResponse>(
    `/collections/${encodeURIComponent(collection)}/documents/search?${buildSearchQuery(params)}`,
  )
}

export function getDocument(collection: string, id: string) {
  return apiFetch<DocumentRecord>(
    `/collections/${encodeURIComponent(collection)}/documents/${encodeURIComponent(id)}`,
  )
}

export function createDocument(collection: string, doc: DocumentRecord) {
  return apiFetch<DocumentRecord>(`/collections/${encodeURIComponent(collection)}/documents`, {
    method: 'POST',
    body: JSON.stringify(doc),
  })
}

export function updateDocument(collection: string, id: string, fields: DocumentRecord) {
  return apiFetch<DocumentRecord>(
    `/collections/${encodeURIComponent(collection)}/documents/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(fields) },
  )
}

export function deleteDocument(collection: string, id: string) {
  return apiFetch<DocumentRecord>(
    `/collections/${encodeURIComponent(collection)}/documents/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
}

export interface ImportRequest {
  documents: DocumentRecord[]
  action?: 'create' | 'upsert' | 'update' | 'emplace'
  batch_size?: number
}

export interface ImportResult {
  success: boolean
  error?: string
  document?: string
}

export interface ImportSummary {
  num_imported: number
  num_failed: number
  results: ImportResult[]
}

export function importDocuments(collection: string, payload: ImportRequest) {
  return apiFetch<ImportSummary>(`/collections/${encodeURIComponent(collection)}/documents/import`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function exportDocuments(collection: string): Promise<Blob> {
  return apiFetchBlob(`/collections/${encodeURIComponent(collection)}/documents/export`)
}

