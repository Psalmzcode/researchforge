'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

export function DashboardShell({ user, children }: { user: any; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const displayName = (user?.name as string | undefined) || (user?.email as string | undefined) || 'Account'

  return (
    <div className="min-h-screen flex relative" style={{ background: 'var(--navy)' }}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <DashboardSidebar user={user} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4 md:px-6 md:py-3"
          style={{
            background: 'var(--nav-bg-scrolled)',
            backdropFilter: 'blur(12px)',
            borderColor: 'var(--card-border)',
          }}
        >
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-colors lg:hidden"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            aria-expanded={mobileOpen}
            aria-controls="dashboard-sidebar"
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="hidden min-w-0 flex-1 lg:block" aria-hidden />
          <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div
              className="hidden max-w-[100px] truncate text-[.78rem] sm:block sm:max-w-[140px] md:max-w-[200px] lg:max-w-[240px] md:text-[.83rem]"
              style={{ color: 'var(--muted)' }}
              title={displayName}
            >
              {displayName}
            </div>
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: 'rgba(0,198,162,.15)', color: 'var(--accent)' }}
            >
              {(user?.name || user?.email || 'U')[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-5 md:p-6">{children}</main>
      </div>
    </div>
  )
}
