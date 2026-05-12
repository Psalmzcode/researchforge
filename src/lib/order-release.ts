import { db } from '@/lib/db'
import { sendDeliverableEmail } from '@/lib/email'
import { createNotification } from '@/lib/notifications'
import { hasInstallmentBalanceForProject } from '@/lib/installment-hold'

/** After Paystack settles, release any orders waiting on final installment for this project. */
export async function releaseHeldOrdersAfterPayment(clientId: string, projectId: string): Promise<void> {
  if (await hasInstallmentBalanceForProject(clientId, projectId)) return

  const held = await db.order.findMany({
    where: { clientId, projectId, status: 'AWAITING_CLIENT_PAYMENT' },
    include: { client: true, deliverables: true },
  })
  if (held.length === 0) return

  for (const order of held) {
    const deliverables = order.deliverables.map((d) => ({ name: d.name, url: d.url, size: d.size }))
    const emailTo = order.deliveryEmail || order.client.email

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED', deliveredAt: new Date() },
      }),
      db.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'COMPLETED',
          note: 'Final installment received — full deliverables released',
        },
      }),
    ])

    await sendDeliverableEmail(emailTo, order.client.name || 'Client', order.orderNumber, deliverables)
    await db.deliverable.updateMany({ where: { orderId: order.id }, data: { sentToEmail: true } })
    await createNotification(
      order.clientId,
      'Deliverables Ready!',
      `Payment complete for ${order.orderNumber}. Your final files are available to download.`,
      'success',
      `/dashboard/client/orders/${order.id}`,
    )
  }
}
