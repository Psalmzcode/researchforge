import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import { OrderMessages } from '@/components/dashboard/OrderMessages'
import { AdminOrderActions } from '@/components/dashboard/AdminOrderActions'
import { DeliverWork } from '@/components/dashboard/DeliverWork'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const [order, researchers] = await Promise.all([
    db.order.findUnique({
      where: { id: params.id },
      include: {
        client: { select:{ name:true,email:true,organization:true } },
        assignee: { select:{ name:true,email:true } },
        briefFiles: true,
        deliverables: true,
        messages: { include:{ user:{ select:{ name:true,role:true } } }, orderBy:{ createdAt:'asc' } },
        timeline: { orderBy:{ createdAt:'asc' } },
      },
    }),
    db.user.findMany({ where:{ role:'RESEARCHER' }, select:{ id:true,name:true,email:true } }),
  ])

  if (!order) notFound()

  const stepLabel: Record<string,string> = { SUBMITTED:'Submitted',REVIEWING:'Under Review',IN_PROGRESS:'In Progress',NEEDS_CLARIFICATION:'Needs Clarification',PENDING_REVIEW:'Pending Admin Review',AWAITING_CLIENT_PAYMENT:'Awaiting final payment (preview)',COMPLETED:'Work Complete',DELIVERED:'Delivered',CANCELLED:'Cancelled' }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/admin/orders" className="text-xs" style={{ color:'var(--muted)' }}>← All Orders</Link>
          <h1 className="font-serif text-2xl font-bold mt-1">{order.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-mono" style={{ color:'var(--accent)' }}>{order.orderNumber}</span>
            <StatusBadge status={order.status}/>
            <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background:'rgba(255,255,255,.05)' }}>Priority: {order.priority}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client brief */}
          <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
            <h2 className="font-semibold text-sm mb-4">Client Brief</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-xs font-medium" style={{ color:'var(--muted)' }}>Description</span><p className="mt-1 leading-relaxed">{order.description}</p></div>
              {order.notes && <div><span className="text-xs font-medium" style={{ color:'var(--muted)' }}>Additional Notes</span><p className="mt-1">{order.notes}</p></div>}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t" style={{ borderColor:'var(--card-border)' }}>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Service</span><p className="font-medium mt-0.5 text-sm">{order.service.replace('_',' ')}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Delivery</span><p className="font-medium mt-0.5 text-sm">{order.deliveryMethod}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Deadline</span><p className="font-medium mt-0.5 text-sm">{order.deadline ? formatDate(order.deadline) : '—'}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Client</span><p className="font-medium mt-0.5 text-sm">{order.client.organization||order.client.name}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Email</span><p className="font-medium mt-0.5 text-sm">{order.client.email}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Budget</span><p className="font-medium mt-0.5 text-sm">{order.budget ? `₦${order.budget.toLocaleString()}` : '—'}</p></div>
              </div>
            </div>
          </div>

          {/* Brief files */}
          {order.briefFiles.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
              <h2 className="font-semibold text-sm mb-4">📎 Brief Documents ({order.briefFiles.length})</h2>
              <div className="space-y-2">
                {order.briefFiles.map(f=>(
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl text-sm border" style={{ borderColor:'var(--card-border)' }}>
                    <span>📄 {f.name} <span className="text-xs" style={{ color:'var(--muted)' }}>({(f.size/1024).toFixed(0)}KB)</span></span>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:'rgba(0,198,162,.15)',color:'var(--accent)' }}>⬇ View</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivered files */}
          {order.deliverables.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'rgba(0,198,162,.2)' }}>
              <h2 className="font-semibold text-sm mb-4">📦 Delivered Files</h2>
              <div className="space-y-2">
                {order.deliverables.map(d=>(
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-xl text-sm border" style={{ borderColor:'var(--card-border)' }}>
                    <div>
                      <p className="font-medium">📄 {d.name}</p>
                      <p className="text-xs" style={{ color:'var(--muted)' }}>{(d.size/1024).toFixed(0)}KB · {d.downloadCount} downloads · {d.sentToEmail ? '✉ Emailed' : 'Not emailed'}</p>
                    </div>
                    <a href={d.url} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:'rgba(0,198,162,.15)',color:'var(--accent)' }}>⬇ View</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <OrderMessages orderId={order.id} initialMessages={order.messages as any} userRole="ADMIN"/>
        </div>

        {/* Right: actions */}
        <div className="space-y-5">
          {/* Status + Assign */}
          <AdminOrderActions order={order as any} researchers={researchers}/>

          {/* Upload deliverable */}
          <DeliverWork orderId={order.id}/>

          {/* Timeline */}
          <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
            <h2 className="font-semibold text-sm mb-4">Timeline</h2>
            <div className="space-y-3">
              {order.timeline.map((t,i)=>(
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background:'var(--accent)' }}/>
                    {i<order.timeline.length-1&&<div className="w-[1px] flex-1 min-h-[16px]" style={{ background:'var(--card-border)' }}/>}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold">{stepLabel[t.status]||t.status}</p>
                    {t.note&&<p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{t.note}</p>}
                    <p className="text-[10px] mt-0.5" style={{ color:'var(--muted)' }}>{formatDate(t.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
