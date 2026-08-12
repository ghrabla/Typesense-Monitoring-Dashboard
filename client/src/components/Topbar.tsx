import type { ReactNode } from 'react'

interface TopbarProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function Topbar({ title, description, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/60 px-8 py-5 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
