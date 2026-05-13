import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { generateInvoiceNumber } from '@/lib/utils'
import { parseJsonBody } from '@/lib/api-error'

const postSchema = z.object({
  projectId: z.string().cuid('Invalid project.'),
  amount: z.number().positive('Quote amount must be greater than zero.'),
  description: z.string().optional(),
  paymentType: z.enum(['FULL', 'INSTALLMENT']).default('FULL'),
  validUntil: z.string().optional(),
})

const patchSchema = z.object({
  quoteId: z.string().cuid('Invalid quote.'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(postSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const data = parsed.data

  const quote = await db.quote.create({
    data: {
      projectId: data.projectId,
      amount: data.amount,
      description: data.description?.trim() || undefined,
      paymentType: data.paymentType,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    },
  })
  return NextResponse.json(quote, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(patchSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const { quoteId } = parsed.data

  const existing = await db.quote.findUnique({
    where: { id: quoteId },
    include: { project: true },
  })
  if (!existing) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (existing.approved) {
    return NextResponse.json(existing)
  }

  const quote = await db.quote.update({
    where: { id: quoteId },
    data: { approved: true, approvedAt: new Date() },
    include: { project: true },
  })
  await db.invoice.create({
    data: {
      number: generateInvoiceNumber(),
      projectId: quote.projectId,
      clientId: quote.project.clientId,
      quoteId: quote.id,
      amount: quote.paymentType === 'INSTALLMENT' ? quote.amount * 0.5 : quote.amount,
      paymentType: quote.paymentType,
      status: 'SENT',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
  await db.project.update({ where: { id: quote.projectId }, data: { status: 'ACTIVE' } })
  return NextResponse.json(quote)
}
