import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPaystackPayment, verifyPaystackWebhook } from '@/lib/paystack'
import { releaseHeldOrdersAfterPayment } from '@/lib/order-release'

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('x-paystack-signature') || ''
  if (!verifyPaystackWebhook(payload, sig)) return NextResponse.json({ error:'Invalid signature' },{status:400})
  const event = JSON.parse(payload)
  if (event.event === 'charge.success') {
    const verification = await verifyPaystackPayment(event.data.reference)
    if (verification.data?.status === 'success') {
      const meta = verification.data.metadata || {}
      const invoiceId = typeof meta.invoiceId === 'string' ? meta.invoiceId : meta.invoiceId?.toString?.()
      if (!invoiceId) return NextResponse.json({ received:true })
      const invoice = await db.invoice.findUnique({ where:{id:invoiceId} })
      if (invoice) {
        const newPaid = invoice.amountPaid + verification.data.amount/100
        const isPaid = newPaid >= invoice.amount
        await db.invoice.update({ where:{id:invoiceId}, data:{amountPaid:newPaid, status:isPaid?'PAID':'SENT', paidAt:isPaid?new Date():undefined, paystackRef:event.data.reference} })
        await db.payment.create({ data:{invoiceId, amount:verification.data.amount/100, reference:event.data.reference, gateway:'paystack', status:'success', metadata:event.data} })
        if (isPaid) {
          await db.project.update({ where:{id:invoice.projectId}, data:{status:'ACTIVE'} })
          await releaseHeldOrdersAfterPayment(invoice.clientId, invoice.projectId)
        }
        await db.activity.create({ data:{projectId:invoice.projectId, action:'Payment received', detail:`₦${(verification.data.amount/100).toLocaleString()} via Paystack`} })
      }
    }
  }
  return NextResponse.json({ received:true })
}
