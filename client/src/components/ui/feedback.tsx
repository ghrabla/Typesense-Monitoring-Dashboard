import type { HTMLAttributes } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin text-slate-400', className)} />
}

export function ErrorBanner({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-700',
        className,
      )}
      {...props}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
