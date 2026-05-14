import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPaystackPayment, verifyPaystackWebhook } from '@/lib/paystack'
import { recordPaystackSuccessfulPayment } from '@/lib/record-paystack-payment'
import {
  invoiceNumberFromSwReference,
  metaInvoiceIdFromPaystack,
  normalizePaystackMeta,
} from '@/lib/paystack-parse'

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('x-paystack-signature') || ''
  if (!verifyPaystackWebhook(payload, sig)) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  const event = JSON.parse(payload)
  if (event.event === 'charge.success') {
    const verification = await verifyPaystackPayment(event.data.reference)
    const data = verification?.data as Record<string, unknown> | undefined
    if (data && String(data.status || '').toLowerCase() === 'success') {
      const meta = normalizePaystackMeta(data.metadata)
      let invoiceId = metaInvoiceIdFromPaystack(meta)

      if (!invoiceId) {
        const num = invoiceNumberFromSwReference(String(event.data.reference || ''))
        if (num) {
          const inv = await db.invoice.findUnique({ where: { number: num }, select: { id: true } })
          if (inv) invoiceId = inv.id
        }
      }

      if (!invoiceId) return NextResponse.json({ received: true })
      const amountKobo = Number(data.amount)
      if (Number.isFinite(amountKobo) && amountKobo > 0) {
        await recordPaystackSuccessfulPayment({
          reference: String(event.data.reference),
          amountKobo,
          invoiceId,
          metadata: data,
        })
      }
    }
  }
  return NextResponse.json({ received: true })
}
