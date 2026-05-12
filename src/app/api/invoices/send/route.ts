import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendInvoiceEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN','FINANCE'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { invoiceId } = await req.json()
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { client: true } })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client/invoices`
  await sendInvoiceEmail(invoice.client.email, invoice.client.name || 'Client', invoice.number, invoice.amount - invoice.amountPaid, payLink)

  return NextResponse.json({ ok: true })
}
