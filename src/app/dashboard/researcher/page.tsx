import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import type { OrderStatus } from '@prisma/client'

function orderProgressPct(status: OrderStatus): number {
  switch (status) {
    case 'SUBMITTED':
    case 'REVIEWING':
      return 15
    case 'AWAITING_CLIENT_PAYMENT':
      return 20
    case 'IN_PROGRESS':
      return 45
    case 'NEEDS_CLARIFICATION':
      return 40
    case 'PENDING_REVIEW':
      return 85
    case 'COMPLETED':
    case 'DELIVERED':
      return 100
    case 'CANCELLED':
      return 0
    default:
      return 0
  }
}

const TERMINAL: OrderStatus[] = ['COMPLETED', 'DELIVERED', 'CANCELLED']

export default async function ResearcherDashboard() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const orders = await db.order.findMany({
    where: { assignedTo: user.id },
    include: {
      client: { select: { name: true, organization: true } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const active = orders.filter((o) => !TERMINAL.includes(o.status))
  const done = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED').length
  const pendingReview = orders.filter((o) => o.status === 'PENDING_REVIEW').length
  const projectIds = new Set(orders.map((o) => o.projectId).filter(Boolean) as string[])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">My Tasks</h1>
        <p className="text-[.88rem] mt-1" style={{ color: 'var(--muted)' }}>
          Orders assigned to you for field work and delivery
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Assigned Orders" value={orders.length} sub={`${active.length} active`} />
        <StatCard label="Active Projects" value={projectIds.size} sub="Linked to your orders" />
        <StatCard label="Delivered" value={done} sub={done > 0 ? 'Great work!' : 'Keep going'} subColor={done > 0 ? 'up' : undefined} />
        <StatCard
          label="Pending Review"
          value={pendingReview}
          sub="Awaiting QC check"
          subColor={pendingReview > 0 ? 'down' : undefined}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 rounded-2xl border p-5"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <h2 className="font-semibold text-[.93rem] mb-4">My orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[.82rem]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                  {['Order', 'Title', 'Project', 'Client', 'Progress', 'Status'].map((h) => (
                    <th key={h} className="text-left pb-3 font-medium" style={{ color: 'var(--muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pct = orderProgressPct(o.status)
                  return (
                    <tr key={o.id} className="border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                      <td className="py-3 font-mono text-[.78rem]">
                        <Link href={`/dashboard/researcher/orders/${o.id}`} className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 font-medium max-w-[180px] truncate">
                        <Link href={`/dashboard/researcher/orders/${o.id}`} className="hover:underline">
                          {o.title}
                        </Link>
                      </td>
                      <td className="py-3 max-w-[140px] truncate" style={{ color: 'var(--muted)' }}>
                        {o.project?.title ?? '—'}
                      </td>
                      <td className="py-3" style={{ color: 'var(--muted)' }}>
                        {o.client.organization || o.client.name}
                      </td>
                      <td className="py-3 w-28">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                          </div>
                          <span className="text-[.73rem]" style={{ color: 'var(--accent)' }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  )
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center" style={{ color: 'var(--muted)' }}>
                      No orders assigned yet — you will see them here when an admin assigns you
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h2 className="font-semibold text-[.93rem] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/dashboard/researcher/orders"
                className="p-3 rounded-xl text-center text-[.83rem] font-medium border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ background: 'rgba(255,255,255,.03)', borderColor: 'var(--card-border)', color: 'var(--muted)' }}
              >
                📋 Open my orders
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h2 className="font-semibold text-[.93rem] mb-4">Order progress</h2>
            {orders.slice(0, 8).map((o) => {
              const pct = orderProgressPct(o.status)
              return (
                <div key={o.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-[.78rem] mb-1 gap-2">
                    <Link href={`/dashboard/researcher/orders/${o.id}`} className="truncate max-w-[200px] hover:underline" style={{ color: 'var(--muted)' }}>
                      {o.orderNumber}
                    </Link>
                    <span style={{ color: 'var(--accent)' }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              )
            })}
            {orders.length === 0 && <p className="text-[.83rem]" style={{ color: 'var(--muted)' }}>Nothing to show yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
