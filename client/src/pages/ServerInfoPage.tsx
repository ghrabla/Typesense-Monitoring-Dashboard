import { useEffect, useState } from 'react'
import { Activity, HeartPulse, Bug } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { StatCard } from '../components/StatCard'
import { MetricsPanel } from '../components/MetricsPanel'
import { Spinner, ErrorBanner } from '../components/ui/feedback'
import { getDebug, getHealth, getMetrics, getStats } from '../api/health'
import { ApiError } from '../api/client'

export function ServerInfoPage() {
  const [healthy, setHealthy] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Record<string, unknown>>({})
  const [metrics, setMetrics] = useState<Record<string, unknown>>({})
  const [debug, setDebug] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [healthRes, statsRes, metricsRes, debugRes] = await Promise.all([
          getHealth().catch(() => ({ ok: false })),
          getStats().catch(() => ({})),
          getMetrics().catch(() => ({})),
          getDebug().catch(() => ({})),
        ])
        if (cancelled) return
        setHealthy(healthRes.ok)
        setStats(statsRes)
        setMetrics(metricsRes)
        setDebug(debugRes)
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load server info')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col">
      <Topbar title="Server" description="Cluster health, stats, metrics, and debug information" />
      <div className="flex flex-col gap-6 p-8">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            <StatCard
              label="Cluster health"
              value={healthy ? 'Healthy' : 'Unavailable'}
              icon={HeartPulse}
              accent={healthy ? 'emerald' : 'rose'}
              hint="Result of GET /health"
            />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <MetricsPanel title="Stats" icon={Activity} metrics={stats} emptyLabel="No stats available." />
              <MetricsPanel title="Metrics" icon={Activity} metrics={metrics} emptyLabel="No metrics available." />
            </div>
            <MetricsPanel title="Debug" icon={Bug} metrics={debug} emptyLabel="No debug info available." />
          </>
        )}
      </div>
    </div>
  )
}
