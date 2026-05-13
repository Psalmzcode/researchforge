import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendStaffInviteEmail } from '@/lib/email'
import { generateInviteToken, hashInviteToken } from '@/lib/verification-tokens'
import { z } from 'zod'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

const INVITE_HOURS = 48

const schema = z.object({
  email: z.string().email().transform(s => s.trim().toLowerCase()),
  name: z.string().trim().max(120).optional().nullable(),
  organization: z.string().trim().max(200).optional().nullable(),
  role: z.enum(['RESEARCHER', 'FINANCE', 'ADMIN']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = session.user as any
  if (admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = schema.parse(await req.json())

    const existing = await db.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 })
    }

    await db.staffInvite.deleteMany({
      where: { email: data.email, consumedAt: null },
    })

    const token = generateInviteToken()
    const tokenHash = hashInviteToken(token)
    const expiresAt = new Date(Date.now() + INVITE_HOURS * 60 * 60 * 1000)

    await db.staffInvite.create({
      data: {
        email: data.email,
        name: data.name || null,
        organization: data.organization || null,
        role: data.role as Role,
        tokenHash,
        expiresAt,
        invitedById: admin.id,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/invite/accept?t=${encodeURIComponent(token)}`
    const roleLabel = data.role === 'RESEARCHER' ? 'Researcher' : data.role === 'FINANCE' ? 'Finance' : 'Admin'

    await sendStaffInviteEmail(data.email, data.name || null, roleLabel, inviteUrl, INVITE_HOURS)

    return NextResponse.json({ ok: true, message: 'Invitation sent.' })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: e.errors?.[0]?.message || 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Could not create invite' }, { status: 500 })
  }
}
