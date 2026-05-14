import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminProjectsPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const projects = await db.project.findMany({
    include: {
      client: { select: { name: true, organization: true, email: true } },
      invoices: true,
      assignments: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold sm:text-2xl">Projects</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All client projects</p></div>
        <Link
          href="/dashboard/admin/projects/new"
          className="inline-flex w-full shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 sm:w-auto"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          + New Project
        </Link>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              {['Project','Client','Service','Team','Budget','Invoiced','Status','Due'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {projects.map(p => {
                const invoiced = p.invoices.reduce((a, i) => a + i.amountPaid, 0)
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{p.title}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium">{p.client.organization || p.client.name}</div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{p.client.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{p.service.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-xs">{p.assignments.map(a => a.user.name).join(', ') || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td className="px-4 py-3 text-xs">{p.budget ? formatCurrency(p.budget) : '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--accent)' }}>{formatCurrency(invoiced)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{p.dueDate ? formatDate(p.dueDate) : '—'}</td>
                  </tr>
                )
              })}
              {projects.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No projects yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
