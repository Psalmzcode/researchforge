import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { sendSignupOtpEmail } from '@/lib/email'
import { generateSignupOtp } from '@/lib/verification-tokens'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/api-error'

const OTP_MINUTES = 15
const OTP_ROUNDS = 8
const COOLDOWN_MS = 60_000

const schema = z.object({
  email: z.preprocess((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v), z.string().email()),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = parseJsonBody(schema, await req.json())
    if (!parsed.ok) return parsed.response
    const { email, password } = parsed.data

    const pending = await db.signupPending.findUnique({ where: { email } })
    if (!pending) {
      return NextResponse.json({ error: 'No pending signup for this email.' }, { status: 404 })
    }

    const pwdOk = await bcrypt.compare(password, pending.passwordHash)
    if (!pwdOk) {
      return NextResponse.json({ error: 'Password does not match your signup.' }, { status: 403 })
    }

    const since = Date.now() - pending.lastSentAt.getTime()
    if (since < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - since) / 1000)
      return NextResponse.json({ error: `Please wait ${wait}s before resending.` }, { status: 429 })
    }

    const otp = generateSignupOtp()
    const codeHash = await bcrypt.hash(otp, OTP_ROUNDS)
    const expiresAt = new Date(Date.now() + OTP_MINUTES * 60 * 1000)

    await db.signupPending.update({
      where: { id: pending.id },
      data: {
        codeHash,
        expiresAt,
        lastSentAt: new Date(),
        attempts: 0,
      },
    })

    await sendSignupOtpEmail(email, otp, OTP_MINUTES)

    return NextResponse.json({ ok: true, message: 'A new code was sent to your email.' })
  } catch {
    return NextResponse.json({ error: 'Could not resend code' }, { status: 500 })
  }
}
