import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendDeliverableEmail, sendDeliverablePreviewHoldEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { ensureFinalInstallmentInvoice, hasInstallmentBalanceForProject } from '@/lib/installment-hold'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: { client: true, deliverables: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status !== 'PENDING_REVIEW') {
    return NextResponse.json({ error: 'Order is not pending review' }, { status: 400 })
  }

  const projectId = order.projectId
  const hold =
    Boolean(projectId) && (await hasInstallmentBalanceForProject(order.clientId, projectId as string))

  const emailTo = order.deliveryEmail || order.client.email
  const orderUrl = `${APP_URL}/dashboard/client/orders/${order.id}`

  if (hold) {
    await db.order.update({
      where: { id: params.id },
      data: { status: 'AWAITING_CLIENT_PAYMENT', reviewedBy: user.id, reviewedAt: new Date() },
    })
    await db.orderTimeline.create({
      data: {
        orderId: order.id,
        status: 'AWAITING_CLIENT_PAYMENT',
        note: 'Installment balance due — dashboard preview available; final files after payment',
        userId: user.id,
      },
    })
    await ensureFinalInstallmentInvoice(order.clientId, projectId as string)
    await sendDeliverablePreviewHoldEmail(emailTo, order.client.name || 'Client', order.orderNumber, orderUrl)
    await createNotification(
      order.clientId,
      'Preview ready — payment due',
      `Your work for ${order.orderNumber} is ready to review on the dashboard. Pay your remaining installment to unlock final downloads.`,
      'info',
      orderUrl,
    )
    return NextResponse.json({ approved: true, paymentHold: true, deliverables: order.deliverables.length })
  }

  await db.order.update({
    where: { id: params.id },
    data: { status: 'COMPLETED', deliveredAt: new Date(), reviewedBy: user.id, reviewedAt: new Date() },
  })
  await db.orderTimeline.create({
    data: { orderId: order.id, status: 'COMPLETED', note: 'Deliverables approved by admin', userId: user.id },
  })

  const deliverables = order.deliverables.map(d => ({ name: d.name, url: d.url, size: d.size }))
  await sendDeliverableEmail(emailTo, order.client.name || 'Client', order.orderNumber, deliverables)
  await db.deliverable.updateMany({ where: { orderId: order.id }, data: { sentToEmail: true } })

  await createNotification(
    order.clientId,
    'Deliverables Ready!',
    `Your work for ${order.orderNumber} is complete. ${order.deliveryMethod !== 'EMAIL' ? 'Download from your dashboard.' : 'Check your email.'}`,
    'success',
    orderUrl,
  )

  return NextResponse.json({ approved: true, paymentHold: false, deliverables: deliverables.length })
}
