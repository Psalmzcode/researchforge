import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'
import { ensureAppSettings } from '@/lib/app-settings'

const patchSchema = z
  .object({
    defaultResearcherSharePercent: z.number().int().min(1).max(100).optional(),
    defaultWebsiteOpsSharePercent: z.number().int().min(1).max(100).optional(),
    websitePayoutBankName: z.string().trim().max(120).nullable().optional(),
    websitePayoutAccountNumber: z.string().trim().max(32).nullable().optional(),
    websitePayoutAccountHolder: z.string().trim().max(120).nullable().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), { message: 'Nothing to update.' })

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN', 'FINANCE'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const row = await ensureAppSettings()
  return NextResponse.json({
    defaultResearcherSharePercent: row.defaultResearcherSharePercent,
    defaultWebsiteOpsSharePercent: row.defaultWebsiteOpsSharePercent ?? 15,
    websitePayoutBankName: row.websitePayoutBankName ?? null,
    websitePayoutAccountNumber: row.websitePayoutAccountNumber ?? null,
    websitePayoutAccountHolder: row.websitePayoutAccountHolder ?? null,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(patchSchema, await req.json())
  if (!parsed.ok) return parsed.response

  const row = await ensureAppSettings()
  const d = parsed.data
  const data: Record<string, unknown> = {}
  if (d.defaultResearcherSharePercent != null) data.defaultResearcherSharePercent = d.defaultResearcherSharePercent
  if (d.defaultWebsiteOpsSharePercent != null) data.defaultWebsiteOpsSharePercent = d.defaultWebsiteOpsSharePercent
  if (d.websitePayoutBankName !== undefined) data.websitePayoutBankName = d.websitePayoutBankName
  if (d.websitePayoutAccountNumber !== undefined) data.websitePayoutAccountNumber = d.websitePayoutAccountNumber
  if (d.websitePayoutAccountHolder !== undefined) data.websitePayoutAccountHolder = d.websitePayoutAccountHolder

  const updated = await (db as any).appSettings.update({
    where: { id: row.id },
    data,
  })
  return NextResponse.json({
    defaultResearcherSharePercent: updated.defaultResearcherSharePercent,
    defaultWebsiteOpsSharePercent: updated.defaultWebsiteOpsSharePercent ?? 15,
    websitePayoutBankName: updated.websitePayoutBankName ?? null,
    websitePayoutAccountNumber: updated.websitePayoutAccountNumber ?? null,
    websitePayoutAccountHolder: updated.websitePayoutAccountHolder ?? null,
  })
}
