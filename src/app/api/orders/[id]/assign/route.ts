import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'
import { sendAssignmentEmail } from '@/lib/email'
import { parseJsonBody } from '@/lib/api-error'
import { getOrderFundingBlockReason } from '@/lib/order-funding'

const bodySchema = z.object({
  researcherId: z.string().cuid('Select a researcher to assign.'),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(bodySchema, await req.json())
  if (!parsed.ok) return parsed.response
  const { researcherId } = parsed.data

  const before = await db.order.findUnique({
    where: { id: params.id },
    select: { id: true, projectId: true, clientId: true },
  })
  if (!before) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const fundingBlock = await getOrderFundingBlockReason(before)
  if (fundingBlock) return NextResponse.json({ error: fundingBlock }, { status: 400 })

  const order = await db.order.update({
    where: { id: params.id },
    data: { assignedTo: researcherId, status: 'IN_PROGRESS' },
    include: { client: true, briefFiles: true },
  })

  const researcher = await db.user.findUnique({ where: { id: researcherId }, select: { name: true, email: true } })

  await db.orderTimeline.create({
    data: { orderId: order.id, status: 'IN_PROGRESS', note: 'Assigned to researcher', userId: user.id },
  })

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

  await createNotification(
    researcherId,
    'New Order Assigned',
    `You have been assigned: ${order.orderNumber}`,
    'info',
    `/dashboard/researcher/orders/${order.id}`,
  )
  await createNotification(
    order.clientId,
    `Order ${order.orderNumber} Assigned`,
    'A researcher has been assigned to your order',
    'success',
    `/dashboard/client/orders/${order.id}`,
  )

  return NextResponse.json(order)
}
