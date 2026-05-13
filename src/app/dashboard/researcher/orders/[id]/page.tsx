import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import { OrderMessages } from '@/components/dashboard/OrderMessages'
import { DeliverWork } from '@/components/dashboard/DeliverWork'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ResearcherOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      client: { select:{ name:true,organization:true } },
      briefFiles: true,
      deliverables: true,
      messages: { where:{ isInternal:false }, include:{ user:{ select:{ name:true,role:true } } }, orderBy:{ createdAt:'asc' } },
      timeline: { orderBy:{ createdAt:'asc' } },
    },
  })

  if (!order) notFound()
  if (order.assignedTo !== user.id && user.role !== 'ADMIN') redirect('/dashboard/researcher')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/researcher/orders" className="text-xs" style={{ color:'var(--muted)' }}>← My Orders</Link>
        <h1 className="font-serif text-2xl font-bold mt-1">{order.title}</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-mono" style={{ color:'var(--accent)' }}>{order.orderNumber}</span>
          <StatusBadge status={order.status}/>
          <span className="text-xs capitalize" style={{ color:'var(--muted)' }}>{order.priority} priority</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Full brief */}
          <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
            <h2 className="font-semibold text-sm mb-4">📋 Client Brief</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-xs font-medium" style={{ color:'var(--muted)' }}>Project Description</span><p className="mt-1 leading-relaxed">{order.description}</p></div>
              {order.notes&&<div><span className="text-xs font-medium" style={{ color:'var(--muted)' }}>Additional Notes</span><p className="mt-1">{order.notes}</p></div>}
              <div className="grid grid-cols-1 gap-3 border-t pt-2 sm:grid-cols-2" style={{ borderColor:'var(--card-border)' }}>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Client</span><p className="font-medium mt-0.5">{order.client.organization||order.client.name}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Service</span><p className="font-medium mt-0.5">{order.service.replace('_',' ')}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Deadline</span><p className="font-medium mt-0.5">{order.deadline?formatDate(order.deadline):'—'}</p></div>
                <div><span className="text-xs" style={{ color:'var(--muted)' }}>Delivery method</span><p className="font-medium mt-0.5">{order.deliveryMethod}</p></div>
              </div>
            </div>
          </div>
          {/* Brief files */}
          {order.briefFiles.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
              <h2 className="font-semibold text-sm mb-4">📎 Brief Documents</h2>
              <div className="space-y-2">
                {order.briefFiles.map(f=>(
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-xl border text-sm" style={{ borderColor:'var(--card-border)' }}>
                    <span>📄 {f.name} <span className="text-xs" style={{ color:'var(--muted)' }}>({(f.size/1024).toFixed(0)}KB)</span></span>
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:'rgba(0,198,162,.15)',color:'var(--accent)' }}>⬇ Open</a>
                  </div>
                ))}
              </div>
            </div>
          )}
          <OrderMessages orderId={order.id} initialMessages={order.messages as any} userRole="RESEARCHER"/>
        </div>
        <div className="space-y-5">
          <DeliverWork orderId={order.id}/>
          <div className="rounded-2xl border p-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
            <h2 className="font-semibold text-sm mb-4">Timeline</h2>
            <div className="space-y-3">
              {order.timeline.map((t,i)=>(
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full mt-1.5" style={{ background:'var(--accent)' }}/>
                    {i<order.timeline.length-1&&<div className="w-px flex-1 min-h-[16px]" style={{ background:'var(--card-border)' }}/>}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold">{t.status.replace('_',' ')}</p>
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
