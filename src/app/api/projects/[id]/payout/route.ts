import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'

const patchSchema = z.object({
  researcherSharePercent: z.number().int().min(1).max(100).nullable().optional(),
  websiteOpsSharePercent: z.number().int().min(1).max(100).nullable().optional(),
  researcherPayoutInitiatedAt: z.union([z.string().datetime(), z.null()]).optional(),
  opsPayoutInitiatedAt: z.union([z.string().datetime(), z.null()]).optional(),
  researcherPayoutTotalRecorded: z.number().min(0).nullable().optional(),
  researcherPayoutPaidAt: z.union([z.string().datetime(), z.null()]).optional(),
  researcherPayoutNote: z.string().max(4000).nullable().optional(),
  opsPayoutTotalRecorded: z.number().min(0).nullable().optional(),
  opsPayoutPaidAt: z.union([z.string().datetime(), z.null()]).optional(),
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

  const project = await db.project.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (d.researcherSharePercent !== undefined) data.researcherSharePercent = d.researcherSharePercent
  if (d.websiteOpsSharePercent !== undefined) data.websiteOpsSharePercent = d.websiteOpsSharePercent
  if (d.researcherPayoutInitiatedAt !== undefined) {
    data.researcherPayoutInitiatedAt =
      d.researcherPayoutInitiatedAt === null ? null : new Date(d.researcherPayoutInitiatedAt)
  }
  if (d.opsPayoutInitiatedAt !== undefined) {
    data.opsPayoutInitiatedAt = d.opsPayoutInitiatedAt === null ? null : new Date(d.opsPayoutInitiatedAt)
  }
  if (d.researcherPayoutTotalRecorded !== undefined) data.researcherPayoutTotalRecorded = d.researcherPayoutTotalRecorded
  if (d.researcherPayoutPaidAt !== undefined) {
    data.researcherPayoutPaidAt = d.researcherPayoutPaidAt === null ? null : new Date(d.researcherPayoutPaidAt)
  }
  if (d.researcherPayoutNote !== undefined) data.researcherPayoutNote = d.researcherPayoutNote
  if (d.opsPayoutTotalRecorded !== undefined) data.opsPayoutTotalRecorded = d.opsPayoutTotalRecorded
  if (d.opsPayoutPaidAt !== undefined) {
    data.opsPayoutPaidAt = d.opsPayoutPaidAt === null ? null : new Date(d.opsPayoutPaidAt)
  }
  if (d.opsPayoutNote !== undefined) data.opsPayoutNote = d.opsPayoutNote

  const updated = await (db as any).project.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(updated)
}
