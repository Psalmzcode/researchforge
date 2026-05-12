import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function ClientMessagesPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const orders = await db.order.findMany({
    where: { clientId: user.id },
    include: {
      messages: {
        where: { isInternal: false },
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: { select: { messages: { where: { isInternal: false } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const ordersWithMessages = orders.filter(o => o._count.messages > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Messages</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Conversations across your orders</p>
      </div>

      {ordersWithMessages.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-4xl mb-3">💬</p>
          <h3 className="font-bold mb-1">No messages yet</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Messages from your order conversations will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ordersWithMessages.map(order => {
            const lastMsg = order.messages[0]
            return (
              <Link key={order.id} href={`/dashboard/client/orders/${order.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:border-[var(--accent)] hover:-translate-y-0.5"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(0,198,162,.1)' }}>💬</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold truncate">{order.title}</h3>
                    <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: 'var(--muted)' }}>{lastMsg ? formatDate(lastMsg.createdAt) : ''}</span>
                  </div>
                  <p className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{order.orderNumber}</p>
                  {lastMsg && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--muted)' }}>
                      <strong>{lastMsg.user.name || lastMsg.user.role}:</strong> {lastMsg.message}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,198,162,.1)', color: 'var(--accent)' }}>
                  {order._count.messages}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
