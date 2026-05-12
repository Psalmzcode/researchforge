import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'
import { sendAssignmentEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { researcherId } = await req.json()
  const order = await db.order.update({
    where: { id: params.id },
    data: { assignedTo: researcherId, status: 'IN_PROGRESS' },
    include: { client: true, briefFiles: true },
  })

  const researcher = await db.user.findUnique({ where: { id: researcherId }, select: { name: true, email: true } })

  await db.orderTimeline.create({ data: { orderId: order.id, status: 'IN_PROGRESS', note: 'Assigned to researcher', userId: user.id } })

  // Email researcher with brief files attached
  if (researcher) {
    const briefs = order.briefFiles.map(f => ({ name: f.name, url: f.url, size: f.size }))
    await sendAssignmentEmail(
      researcher.email,
      researcher.name || 'Researcher',
      order.orderNumber,
      order.title,
      order.description,
      briefs,
    )
  }

  // Dashboard notifications
  await createNotification(researcherId, 'New Order Assigned', `You have been assigned: ${order.orderNumber}`, 'info', `/dashboard/researcher/orders/${order.id}`)
  await createNotification(order.clientId, `Order ${order.orderNumber} Assigned`, 'A researcher has been assigned to your order', 'success', `/dashboard/client/orders/${order.id}`)

  return NextResponse.json(order)
}
