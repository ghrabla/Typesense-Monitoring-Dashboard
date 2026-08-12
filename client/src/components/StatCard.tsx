import type { LucideIcon } from 'lucide-react'
import { Card } from './ui/card'
import { cn } from '../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
  accent?: 'slate' | 'emerald' | 'sky' | 'amber' | 'rose'
}

const ACCENTS: Record<NonNullable<StatCardProps['accent']>, string> = {
  slate: 'bg-slate-100 text-slate-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  sky: 'bg-sky-50 text-sky-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
}

export function StatCard({ label, value, icon: Icon, hint, accent = 'slate' }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', ACCENTS[accent])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </Card>
  )
}
