import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const priorityColor: Record<string,string> = { urgent:'#e24b4a',high:'#f0a500',normal:'var(--muted)',low:'#8892a4' }

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const orders = await db.order.findMany({
    include: { client: { select:{ name:true,email:true,organization:true } }, assignee:{ select:{name:true} }, deliverables:true, _count:{ select:{ messages:true,briefFiles:true } } },
    orderBy: { createdAt: 'desc' },
  })

  const groups = { new: orders.filter(o=>o.status==='SUBMITTED'), reviewing: orders.filter(o=>o.status==='REVIEWING'||o.status==='PENDING_REVIEW'||o.status==='AWAITING_CLIENT_PAYMENT'), active: orders.filter(o=>o.status==='IN_PROGRESS'), done: orders.filter(o=>['COMPLETED','DELIVERED'].includes(o.status)) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-serif text-xl font-bold sm:text-2xl">Order Management</h1>
        <p className="text-sm mt-1" style={{ color:'var(--muted)' }}>Review, assign, and deliver client work</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[['New', groups.new.length,'#e24b4a'],['Reviewing',groups.reviewing.length,'#f0a500'],['In Progress',groups.active.length,'#378add'],['Completed',groups.done.length,'#00c6a2']].map(([l,c,col])=>(
          <div key={l} className="rounded-2xl border p-4 text-center" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: col as string }}>{c}</div>
            <div className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead><tr className="border-b" style={{ borderColor:'var(--card-border)' }}>
              {['Order','Client','Service','Priority','Assigned','Brief','Status','Due',''].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color:'var(--muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)] transition-colors" style={{ borderColor:'var(--card-border)' }}>
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-[180px]">{o.title}</div>
                    <div className="text-xs font-mono" style={{ color:'var(--accent)' }}>{o.orderNumber}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{o.client.organization||o.client.name}</div>
                    <div className="text-xs" style={{ color:'var(--muted)' }}>{o.client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color:'var(--muted)' }}>{o.service.replace('_',' ')}</td>
                  <td className="px-4 py-3"><span className="text-xs font-semibold capitalize" style={{ color:priorityColor[o.priority] }}>● {o.priority}</span></td>
                  <td className="px-4 py-3 text-xs">{o.assignee?.name || <span style={{ color:'var(--muted)' }}>Unassigned</span>}</td>
                  <td className="px-4 py-3 text-xs">{o._count.briefFiles > 0 ? <span style={{ color:'var(--accent)' }}>📎 {o._count.briefFiles}</span> : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status}/></td>
                  <td className="px-4 py-3 text-xs" style={{ color:'var(--muted)' }}>{o.deadline ? formatDate(o.deadline) : '—'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/admin/orders/${o.id}`} className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90" style={{ background:'rgba(0,198,162,.15)',color:'var(--accent)' }}>Review →</Link>
                  </td>
                </tr>
              ))}
              {orders.length===0&&<tr><td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color:'var(--muted)' }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
