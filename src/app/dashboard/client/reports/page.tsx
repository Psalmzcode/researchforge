import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { DownloadButton } from '@/components/dashboard/DownloadButton'

export default async function ClientReportsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const orders = await db.order.findMany({
    where: {
      clientId: user.id,
      status: { in: ['COMPLETED', 'DELIVERED'] },
      deliverables: { some: {} },
    },
    include: { deliverables: { orderBy: { createdAt: 'desc' } } },
    orderBy: { updatedAt: 'desc' },
  })

  const totalFiles = orders.reduce((sum, o) => sum + o.deliverables.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Reports & Files</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All deliverables across your orders</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Total Files</div>
          <div className="font-serif text-2xl font-bold">{totalFiles}</div>
        </div>
        <div className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Orders With Files</div>
          <div className="font-serif text-2xl font-bold">{orders.length}</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-4xl mb-3">📄</p>
          <h3 className="font-bold mb-1">No reports yet</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Deliverables will appear here once your orders are completed</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">{order.title}</h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{order.orderNumber}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{order.deliverables.length} file(s)</span>
              </div>
              <div className="space-y-2">
                {order.deliverables.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--card-border)', background: 'rgba(0,198,162,.04)' }}>
                    <div>
                      <p className="text-sm font-medium">📄 {d.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {(d.size / 1024).toFixed(0)}KB · {formatDate(d.createdAt)}
                        {d.sentToEmail ? ' · ✉ Emailed' : ''}
                      </p>
                    </div>
                    <DownloadButton deliverableId={d.id} filename={d.name} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
