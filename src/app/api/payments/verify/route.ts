import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyPaystackPayment } from '@/lib/paystack'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })

  const verification = await verifyPaystackPayment(ref)
  if (!verification?.status || verification.data?.status !== 'success') {
    return NextResponse.json({ ok: false, error: verification?.message || 'Verification failed' }, { status: 400 })
  }

  const invoiceId = verification.data?.metadata?.invoiceId
  if (!invoiceId || typeof invoiceId !== 'string') {
    return NextResponse.json({ ok: false, error: 'Invalid payment metadata' }, { status: 400 })
  }

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { project: { select: { title: true } } },
  })
  if (!invoice) return NextResponse.json({ ok: false, error: 'Invoice not found' }, { status: 404 })
  if (invoice.clientId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const amount = (verification.data.amount || 0) / 100
  return NextResponse.json({
    ok: true,
    reference: ref,
    amount,
    invoiceNumber: invoice.number,
    projectTitle: invoice.project.title,
    invoiceStatus: invoice.status,
  })
}
