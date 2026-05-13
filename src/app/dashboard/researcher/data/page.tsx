import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export default async function ResearcherDataPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const orders = await db.order.findMany({
    where: { assignedTo: user.id },
    include: {
      briefFiles: { orderBy: { createdAt: 'desc' } },
      deliverables: { orderBy: { createdAt: 'desc' } },
      client: { select: { name: true, organization: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const totalBriefs = orders.reduce((s, o) => s + o.briefFiles.length, 0)
  const totalDeliverables = orders.reduce((s, o) => s + o.deliverables.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Data Collection</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Brief files received and deliverables uploaded</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          ['Orders', orders.length, 'var(--accent)'],
          ['Brief Files', totalBriefs, '#378add'],
          ['Deliverables Uploaded', totalDeliverables, '#f0a500'],
        ].map(([label, count, color]) => (
          <div key={label as string} className="rounded-2xl border p-4 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: color as string }}>{count}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-4xl mb-3">📊</p>
          <h3 className="font-bold mb-1">No data yet</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Brief files and uploaded deliverables will appear here once you have assignments</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">{order.title}</h3>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{order.client.organization || order.client.name} · {order.orderNumber}</span>
                </div>
                <span className="text-[.7rem] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0,198,162,.1)', color: 'var(--accent)' }}>{order.status.replace('_', ' ')}</span>
              </div>

              {order.briefFiles.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold mb-2" style={{ color: '#378add' }}>📥 Brief Files ({order.briefFiles.length})</h4>
                  <div className="space-y-1.5">
                    {order.briefFiles.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(55,138,221,.06)' }}>
                        <div>
                          <p className="text-xs font-medium">{f.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{(f.size / 1024).toFixed(0)}KB · {formatDate(f.createdAt)}</p>
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors hover:opacity-80"
                          style={{ background: 'rgba(55,138,221,.12)', color: '#378add' }}>
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.deliverables.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2" style={{ color: '#f0a500' }}>📤 Uploaded Deliverables ({order.deliverables.length})</h4>
                  <div className="space-y-1.5">
                    {order.deliverables.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(240,165,0,.06)' }}>
                        <div>
                          <p className="text-xs font-medium">{d.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{(d.size / 1024).toFixed(0)}KB · {formatDate(d.createdAt)}</p>
                        </div>
                        <a href={d.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors hover:opacity-80"
                          style={{ background: 'rgba(240,165,0,.12)', color: '#f0a500' }}>
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order.briefFiles.length === 0 && order.deliverables.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>No files yet for this order</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
