import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const priorityColor: Record<string,string> = { urgent:'#e24b4a', high:'#f0a500', normal:'var(--muted)', low:'#8892a4' }
const serviceLabel: Record<string,string> = { RESEARCH:'Research',DIGITAL_SURVEY:'Digital Survey',SUSTAINABILITY:'Sustainability',ADVISORY:'Advisory' }

export default async function ClientOrdersPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const orders = await db.order.findMany({
    where: { clientId: user.id },
    include: { deliverables: true, briefFiles: true, _count: { select: { messages: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const counts = { all: orders.length, active: orders.filter(o=>['SUBMITTED','REVIEWING','IN_PROGRESS','NEEDS_CLARIFICATION','PENDING_REVIEW','AWAITING_CLIENT_PAYMENT'].includes(o.status)).length, done: orders.filter(o=>['COMPLETED','DELIVERED'].includes(o.status)).length }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">My Orders</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Track all your submitted work requests</p>
        </div>
        <Link href="/dashboard/client/orders/new"
          className="px-5 py-2.5 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,198,162,.3)]"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
          + New Order
        </Link>
      </div>
      <div className="flex gap-3">
        {[['All', counts.all], ['Active', counts.active], ['Completed', counts.done]].map(([l, c]) => (
          <div key={l} className="px-4 py-2 rounded-full text-xs font-medium border" style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>{l} <span className="font-bold" style={{ color: 'var(--accent)' }}>{c}</span></div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-4xl mb-3">📋</p>
          <h3 className="font-bold mb-1">No orders yet</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Submit your first project brief and we&apos;ll get to work</p>
          <Link href="/dashboard/client/orders/new" className="inline-block px-6 py-2.5 rounded-full font-bold text-sm" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>Submit First Order →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} href={`/dashboard/client/orders/${order.id}`}
              className="flex items-center gap-5 p-5 rounded-2xl border transition-all hover:border-[var(--accent)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.2)]"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm truncate">{order.title}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{order.orderNumber}</span>
                  {order.priority !== 'normal' && <span className="text-xs font-semibold" style={{ color: priorityColor[order.priority] }}>● {order.priority}</span>}
                </div>
                <p className="text-xs line-clamp-1" style={{ color: 'var(--muted)' }}>{order.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{serviceLabel[order.service]}</span>
                  <span>Submitted {formatDate(order.createdAt)}</span>
                  {order.deadline && <span>Due {formatDate(order.deadline)}</span>}
                  {order._count.messages > 0 && <span>💬 {order._count.messages}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <StatusBadge status={order.status}/>
                {order.deliverables.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,198,162,.12)', color: 'var(--accent)' }}>📥 {order.deliverables.length} file(s) ready</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
