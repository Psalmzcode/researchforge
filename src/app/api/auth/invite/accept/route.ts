import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { hashInviteToken } from '@/lib/verification-tokens'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(64, 'Invalid invitation link'),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json())
    const tokenHash = hashInviteToken(token.trim())

    const invite = await db.staffInvite.findUnique({ where: { tokenHash } })
    if (!invite || invite.consumedAt) {
      return NextResponse.json({ error: 'Invalid or already used invitation link.' }, { status: 400 })
    }
    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This invitation has expired. Ask an admin to send a new one.' }, { status: 400 })
    }

    const taken = await db.user.findUnique({ where: { email: invite.email } })
    if (taken) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await db.$transaction([
      db.user.create({
        data: {
          email: invite.email,
          name: invite.name,
          organization: invite.organization,
          password: passwordHash,
          role: invite.role,
          emailVerified: new Date(),
        },
      }),
      db.staffInvite.update({
        where: { id: invite.id },
        data: { consumedAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true, message: 'Account activated. You can sign in.' })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ error: e.errors?.[0]?.message || 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Could not complete invitation' }, { status: 500 })
  }
}
