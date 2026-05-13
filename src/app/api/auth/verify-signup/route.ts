import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { Role } from '@prisma/client'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/api-error'

const MAX_ATTEMPTS = 8

const schema = z.object({
  email: z.preprocess((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v), z.string().email()),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = parseJsonBody(schema, await req.json())
    if (!parsed.ok) return parsed.response
    const { email, code } = parsed.data

    const pending = await db.signupPending.findUnique({ where: { email } })
    if (!pending) {
      return NextResponse.json({ error: 'No pending signup for this email. Register again.' }, { status: 400 })
    }
    if (pending.expiresAt < new Date()) {
      await db.signupPending.delete({ where: { id: pending.id } })
      return NextResponse.json({ error: 'Code expired. Please sign up again.' }, { status: 400 })
    }
    if (pending.attempts >= MAX_ATTEMPTS) {
      await db.signupPending.delete({ where: { id: pending.id } })
      return NextResponse.json({ error: 'Too many attempts. Please start registration again.' }, { status: 429 })
    }

    const ok = await bcrypt.compare(code, pending.codeHash)
    if (!ok) {
      await db.signupPending.update({
        where: { id: pending.id },
        data: { attempts: { increment: 1 } },
      })
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    const exists = await db.user.findUnique({ where: { email } })
    if (exists) {
      await db.signupPending.delete({ where: { id: pending.id } })
      return NextResponse.json({ error: 'Account already exists. Sign in instead.' }, { status: 409 })
    }

    await db.$transaction([
      db.user.create({
        data: {
          email,
          name: pending.name,
          password: pending.passwordHash,
          role: Role.CLIENT,
          emailVerified: new Date(),
        },
      }),
      db.signupPending.delete({ where: { id: pending.id } }),
    ])

    return NextResponse.json({ ok: true, message: 'Email verified. You can sign in.' })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
