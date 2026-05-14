import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'

const patchSchema = z.object({
  researcherSharePercent: z.number().int().min(1).max(100).nullable().optional(),
  researcherPaidAmount: z.number().min(0).nullable().optional(),
  researcherPaidAt: z.union([z.string().datetime(), z.null()]).optional(),
  researcherPayoutNote: z.string().max(4000).nullable().optional(),
  opsPayoutAmount: z.number().min(0).nullable().optional(),
  opsPaidAt: z.union([z.string().datetime(), z.null()]).optional(),
  opsPayoutNote: z.string().max(4000).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN', 'FINANCE'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(patchSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const d = parsed.data

  const order = await db.order.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (d.researcherSharePercent !== undefined) data.researcherSharePercent = d.researcherSharePercent
  if (d.researcherPaidAmount !== undefined) data.researcherPaidAmount = d.researcherPaidAmount
  if (d.researcherPaidAt !== undefined) {
    data.researcherPaidAt = d.researcherPaidAt === null ? null : new Date(d.researcherPaidAt)
  }
  if (d.researcherPayoutNote !== undefined) data.researcherPayoutNote = d.researcherPayoutNote
  if (d.opsPayoutAmount !== undefined) data.opsPayoutAmount = d.opsPayoutAmount
  if (d.opsPaidAt !== undefined) {
    data.opsPaidAt = d.opsPaidAt === null ? null : new Date(d.opsPaidAt)
  }
  if (d.opsPayoutNote !== undefined) data.opsPayoutNote = d.opsPayoutNote

  const updated = await (db as any).order.update({
    where: { id: params.id },
    data,
    include: {
      assignee: { select: { name: true, email: true } },
      client: { select: { name: true, organization: true } },
    },
  })
  return NextResponse.json(updated)
}
