import type { ReactNode } from 'react'
import { GraduationCap } from 'lucide-react'
import {
  AppNavigation,
  type AppPage,
} from './AppNavigation'

interface AppShellProps {
  children: ReactNode
  currentPage: AppPage
  onNavigate(page: AppPage): void
  syncLabel: string
}

export function AppShell({
  children,
  currentPage,
  onNavigate,
  syncLabel,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <GraduationCap size={22} strokeWidth={1.8} />
          </span>
          <div>
            <strong>数学教学反思</strong>
            <span>人教A版2019</span>
          </div>
        </div>

        <AppNavigation
          currentPage={currentPage}
          onNavigate={onNavigate}
          variant="desktop"
        />

        <span
          className="sync-indicator"
          role="status"
          aria-live="polite"
        >
          <span className="sync-dot" aria-hidden="true" />
          {syncLabel}
        </span>
      </header>

      <main className="app-main">{children}</main>

      <AppNavigation
        currentPage={currentPage}
        onNavigate={onNavigate}
        variant="mobile"
      />
    </div>
  )
}
