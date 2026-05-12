import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function ResearcherOrdersPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const orders = await db.order.findMany({
    where: { assignedTo: user.id },
    include: { client:{ select:{ name:true,organization:true } }, briefFiles:true, deliverables:true, _count:{ select:{ messages:true } } },
    orderBy: { createdAt:'desc' },
  })

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl font-bold">My Assigned Orders</h1>
      <p className="text-sm mt-1" style={{ color:'var(--muted)' }}>Work assigned to you — read briefs, submit work</p></div>
      <div className="space-y-3">
        {orders.map(o=>(
          <Link key={o.id} href={`/dashboard/researcher/orders/${o.id}`}
            className="flex items-start gap-5 p-5 rounded-2xl border transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
            style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{o.title}</span>
                <span className="text-xs font-mono" style={{ color:'var(--accent)' }}>{o.orderNumber}</span>
              </div>
              <div className="flex gap-4 text-xs mt-1" style={{ color:'var(--muted)' }}>
                <span>{o.client.organization||o.client.name}</span>
                <span>{o.service.replace('_',' ')}</span>
                {o.deadline && <span>Due {formatDate(o.deadline)}</span>}
                {o._count.messages > 0 && <span>💬 {o._count.messages}</span>}
                {o.briefFiles.length > 0 && <span style={{ color:'var(--accent)' }}>📎 {o.briefFiles.length} brief files</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={o.status}/>
              {o.deliverables.length > 0 && <span className="text-xs" style={{ color:'var(--accent)' }}>✅ {o.deliverables.length} delivered</span>}
            </div>
          </Link>
        ))}
        {orders.length===0&&(
          <div className="rounded-2xl border p-12 text-center" style={{ borderColor:'var(--card-border)' }}>
            <p className="text-4xl mb-3">📋</p>
            <p className="font-bold mb-1">No assignments yet</p>
            <p className="text-sm" style={{ color:'var(--muted)' }}>Orders assigned by admin will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
