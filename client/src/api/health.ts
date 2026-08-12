import { apiFetch } from './client'

export interface HealthResponse {
  ok: boolean
}

export type StatsResponse = Record<string, unknown>
export type MetricsResponse = Record<string, unknown>
export type DebugResponse = Record<string, unknown>

export function getHealth() {
  return apiFetch<HealthResponse>('/health')
}

export function getStats() {
  return apiFetch<StatsResponse>('/stats')
}

export function getMetrics() {
  return apiFetch<MetricsResponse>('/metrics')
}

export function getDebug() {
  return apiFetch<DebugResponse>('/debug')
}
