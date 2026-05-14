import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { initializePaystackPayment } from '@/lib/paystack'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/api-error'

const schema = z.object({
  invoiceId: z.string().cuid('Invalid invoice.'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const parsed = parseJsonBody(schema, await req.json())
  if (!parsed.ok) return parsed.response
  const { invoiceId } = parsed.data

  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { client: true } })
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.clientId !== user.id && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const reference = `SW-${invoice.number}-${Date.now()}`
  const amountDue = invoice.amount - invoice.amountPaid
  const result = await initializePaystackPayment({
    email: invoice.client.email,
    amount: amountDue,
    reference,
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/payment-result?reference=${encodeURIComponent(reference)}&i=${encodeURIComponent(invoiceId)}`,
    metadata: { invoiceId, invoiceNumber: invoice.number },
  })
  if (result.status) return NextResponse.json({ authorizationUrl: result.data.authorization_url, reference })
  return NextResponse.json({ error: 'Payment init failed' }, { status: 500 })
}
