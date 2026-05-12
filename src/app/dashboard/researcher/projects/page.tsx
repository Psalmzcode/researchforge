import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function ResearcherProjectsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const projects = await db.project.findMany({
    where: { assignments: { some: { userId: user.id } } },
    include: {
      client: { select: { name: true, organization: true } },
      assignments: { where: { userId: user.id } },
      _count: { select: { files: true, orders: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const active = projects.filter(p => p.status === 'ACTIVE').length
  const complete = projects.filter(p => p.status === 'COMPLETE').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">My Projects</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Projects you&apos;re assigned to</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total Projects', projects.length, 'var(--accent)'],
          ['Active', active, '#f0a500'],
          ['Completed', complete, '#378add'],
        ].map(([label, count, color]) => (
          <div key={label as string} className="rounded-2xl border p-4 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: color as string }}>{count}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-4xl mb-3">📋</p>
          <h3 className="font-bold mb-1">No projects assigned</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Projects you&apos;re assigned to will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map(p => {
            const asgn = p.assignments[0]
            return (
              <div key={p.id} className="rounded-2xl border p-5 transition-all hover:-translate-y-0.5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{p.client.organization || p.client.name}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {p.description && (
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{p.description}</p>
                )}

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--muted)' }}>Progress</span>
                    <span style={{ color: 'var(--accent)' }}>{asgn?.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${asgn?.progress || 0}%`, background: 'var(--accent)' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
                  <span>📄 {p._count.files} files · 📦 {p._count.orders} orders</span>
                  <span>{p.dueDate ? `Due ${formatDate(p.dueDate)}` : 'No deadline'}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
