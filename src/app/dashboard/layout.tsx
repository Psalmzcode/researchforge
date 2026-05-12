import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { NotificationBell } from '@/components/dashboard/NotificationBell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!(session.user as { id?: string })?.id) redirect('/login')
  return (
    <div className="min-h-screen flex" style={{background:'var(--navy)'}}>
      <DashboardSidebar user={session.user as any} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b" style={{background:'var(--nav-bg-scrolled)',backdropFilter:'blur(12px)',borderColor:'var(--card-border)'}}>
          <div/>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div className="text-[.83rem]" style={{color:'var(--muted)'}}>{(session.user as any).name || session.user?.email}</div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{background:'rgba(0,198,162,.15)',color:'var(--accent)'}}>
              {((session.user as any).name || 'U')[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
