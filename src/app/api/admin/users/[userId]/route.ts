import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'
import type { Role } from '@prisma/client'

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  organization: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  role: z.enum(['ADMIN', 'RESEARCHER', 'FINANCE']).optional(),
  payoutBankName: z.string().trim().max(120).nullable().optional(),
  payoutAccountNumber: z.string().trim().max(32).nullable().optional(),
  payoutAccountHolder: z.string().trim().max(120).nullable().optional(),
})

const STAFF_ROLES: Role[] = ['ADMIN', 'RESEARCHER', 'FINANCE']

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const me = session.user as any
  if (me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(patchSchema, await req.json())
  if (!parsed.ok) return parsed.response

  const target = await db.user.findUnique({ where: { id: params.userId }, select: { id: true, role: true } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (!STAFF_ROLES.includes(target.role)) {
    return NextResponse.json({ error: 'Only internal team accounts can be edited here.' }, { status: 403 })
  }

  const data = parsed.data
  if (data.role && data.role !== target.role) {
    if (target.role === 'ADMIN' && data.role !== 'ADMIN') {
      const otherAdmins = await db.user.count({ where: { role: 'ADMIN', id: { not: target.id } } })
      if (otherAdmins < 1) {
        return NextResponse.json(
          { error: 'This is the only admin account. Create another admin before changing this user’s role.' },
          { status: 400 },
        )
      }
    }
  }

  if (data.role && data.role !== target.role && target.id === me.id) {
    return NextResponse.json({ error: 'You cannot change your own role here.' }, { status: 400 })
  }

  const hasPayoutFields =
    data.payoutBankName !== undefined ||
    data.payoutAccountNumber !== undefined ||
    data.payoutAccountHolder !== undefined
  if (hasPayoutFields && target.role !== 'RESEARCHER') {
    return NextResponse.json({ error: 'Payout bank details can only be set for researcher accounts.' }, { status: 400 })
  }

  const updated = await (db as any).user.update({
    where: { id: params.userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.organization !== undefined ? { organization: data.organization ?? null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.payoutBankName !== undefined ? { payoutBankName: data.payoutBankName } : {}),
      ...(data.payoutAccountNumber !== undefined ? { payoutAccountNumber: data.payoutAccountNumber } : {}),
      ...(data.payoutAccountHolder !== undefined ? { payoutAccountHolder: data.payoutAccountHolder } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      phone: true,
      payoutBankName: true,
      payoutAccountNumber: true,
      payoutAccountHolder: true,
      updatedAt: true,
    },
  })
  return NextResponse.json(updated)
}
