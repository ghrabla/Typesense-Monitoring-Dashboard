import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#eef1f8,_#f5f6fa)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
