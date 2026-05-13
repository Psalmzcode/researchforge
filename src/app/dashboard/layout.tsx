import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')
  if (!(session.user as { id?: string })?.id) redirect('/login')
  return <DashboardShell user={session.user as any}>{children}</DashboardShell>
}
