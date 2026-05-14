import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyPaystackPayment } from '@/lib/paystack'
import { db } from '@/lib/db'
import { recordPaystackSuccessfulPayment } from '@/lib/record-paystack-payment'
import {
  invoiceNumberFromSwReference,
  metaInvoiceIdFromPaystack,
  normalizePaystackMeta,
} from '@/lib/paystack-parse'

/** Paystack redirect uses `reference`; we also accept `ref` / `trxref`. */
function transactionRefFromRequest(req: NextRequest): string | null {
  const sp = req.nextUrl.searchParams
  return sp.get('reference') || sp.get('ref') || sp.get('trxref')
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const txRef = transactionRefFromRequest(req)
  if (!txRef) {
    return NextResponse.json(
      { error: 'Missing transaction reference (expected ?reference= from Paystack, or ?ref=).' },
      { status: 400 },
    )
  }

  const verification = await verifyPaystackPayment(txRef)
  if (!verification?.status) {
    return NextResponse.json(
      { ok: false, error: (verification as { message?: string })?.message || 'Paystack verification failed' },
      { status: 400 },
    )
  }

  const data = verification.data as Record<string, unknown> | undefined
  if (!data || String(data.status || '').toLowerCase() !== 'success') {
    return NextResponse.json(
      { ok: false, error: `Transaction not successful (${data?.status ?? 'unknown'})` },
      { status: 400 },
    )
  }

  const meta = normalizePaystackMeta(data.metadata)
  let invoiceId = metaInvoiceIdFromPaystack(meta)

  const hintId = req.nextUrl.searchParams.get('i')
  if (!invoiceId && hintId && hintId.length >= 20 && /^[a-z0-9]+$/i.test(hintId)) {
    invoiceId = hintId
  }

  if (!invoiceId) {
    const num = invoiceNumberFromSwReference(txRef)
    if (num) {
      const inv = await db.invoice.findFirst({
        where: { number: num, clientId: user.id },
        select: { id: true },
      })
      if (inv) invoiceId = inv.id
    }
  }

  if (!invoiceId) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Could not resolve invoice from Paystack metadata. Contact support with your payment reference.',
      },
      { status: 400 },
    )
  }

  const invoiceBefore = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { project: { select: { title: true } } },
  })
  if (!invoiceBefore) return NextResponse.json({ ok: false, error: 'Invoice not found' }, { status: 404 })
  if (invoiceBefore.clientId !== user.id && user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  const amountKobo = Number(data.amount)
  if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
    return NextResponse.json({ ok: false, error: 'Invalid amount from Paystack' }, { status: 400 })
  }

  const canonicalRef = typeof data.reference === 'string' && data.reference.length > 0 ? data.reference : txRef

  const recorded = await recordPaystackSuccessfulPayment({
    reference: canonicalRef,
    amountKobo,
    invoiceId,
    metadata: data,
  })

  if (!recorded.ok) {
    return NextResponse.json({ ok: false, error: 'Could not record payment' }, { status: 400 })
  }

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { project: { select: { title: true } } },
  })
  if (!invoice) return NextResponse.json({ ok: false, error: 'Invoice not found' }, { status: 404 })

  return NextResponse.json({
    ok: true,
    reference: canonicalRef,
    amount: amountKobo / 100,
    amountPaid: invoice.amountPaid,
    invoiceNumber: invoice.number,
    projectTitle: invoice.project.title,
    invoiceStatus: invoice.status,
    alreadyRecorded: recorded.alreadyRecorded,
  })
}
