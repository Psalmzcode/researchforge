import { db } from '@/lib/db'

type SessionUser = { id: string; role: string }

/** null = allowed; otherwise HTTP-style problem */
export async function orderMessageAccessResult(
  orderId: string,
  user: SessionUser,
): Promise<'notfound' | 'forbidden' | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { clientId: true, assignedTo: true },
  })
  if (!order) return 'notfound'
  if (user.role === 'ADMIN') return null
  if (user.role === 'CLIENT' && order.clientId === user.id) return null
  if (user.role === 'RESEARCHER' && order.assignedTo === user.id) return null
  return 'forbidden'
}
