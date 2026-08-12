import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Database, FileStack, HeartPulse } from 'lucide-react'
import { Topbar } from '../components/Topbar'
import { StatCard } from '../components/StatCard'
import { CollectionTable } from '../components/CollectionTable'
import { MetricsPanel } from '../components/MetricsPanel'
import { Spinner, ErrorBanner } from '../components/ui/feedback'
import { listCollections, type CollectionSummary } from '../api/collections'
import { getHealth, getMetrics, getStats } from '../api/health'
import { ApiError } from '../api/client'

export function DashboardPage() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState<CollectionSummary[]>([])
  const [stats, setStats] = useState<Record<string, unknown>>({})
  const [metrics, setMetrics] = useState<Record<string, unknown>>({})
  const [healthy, setHealthy] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const [collectionsRes, statsRes, metricsRes, healthRes] = await Promise.all([
          listCollections(),
          getStats().catch(() => ({})),
          getMetrics().catch(() => ({})),
          getHealth().catch(() => ({ ok: false })),
        ])
        if (cancelled) return
        setCollections(collectionsRes)
        setStats(statsRes)
        setMetrics(metricsRes)
        setHealthy(healthRes.ok)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard data')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const totalDocuments = collections.reduce((sum, c) => sum + c.num_documents, 0)

  return (
    <div className="flex flex-col">
      <Topbar title="Overview" description="A snapshot of your Typesense cluster" />
      <div className="flex flex-col gap-6 p-8">
        {error && <ErrorBanner>{error}</ErrorBanner>}

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Collections" value={collections.length} icon={Database} accent="sky" />
              <StatCard
                label="Total Documents"
                value={totalDocuments.toLocaleString()}
                icon={FileStack}
                accent="emerald"
              />
              <StatCard
                label="Cluster Health"
                value={healthy ? 'Healthy' : 'Unavailable'}
                icon={HeartPulse}
                accent={healthy ? 'emerald' : 'rose'}
              />
              <StatCard
                label="Uptime"
                value={String(stats['uptime'] ?? metrics['system_uptime'] ?? '—')}
                icon={Activity}
                accent="amber"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <MetricsPanel title="Stats" icon={Activity} metrics={stats} emptyLabel="No stats available." />
              <MetricsPanel title="Metrics" icon={HeartPulse} metrics={metrics} emptyLabel="No metrics available." />
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Collections</h2>
              <CollectionTable
                collections={collections}
                onOpen={(name) => navigate(`/collections/${encodeURIComponent(name)}`)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
