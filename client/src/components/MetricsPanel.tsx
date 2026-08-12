import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface MetricsPanelProps {
  title: string
  icon?: LucideIcon
  metrics: Record<string, unknown>
  emptyLabel?: string
}

function formatKey(key: string): string {
  return key
    .replace(/[_.]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function MetricsPanel({ title, icon: Icon, metrics, emptyLabel }: MetricsPanelProps) {
  const entries = Object.entries(metrics ?? {})

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-400">{emptyLabel ?? 'No data available.'}</p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <dt className="truncate text-xs text-slate-500" title={key}>
                  {formatKey(key)}
                </dt>
                <dd className="truncate text-sm font-medium text-slate-900" title={formatValue(value)}>
                  {formatValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
