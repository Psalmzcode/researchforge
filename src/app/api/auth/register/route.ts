import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { sendSignupOtpEmail } from '@/lib/email'
import { generateSignupOtp } from '@/lib/verification-tokens'

const OTP_MINUTES = 15
const OTP_ROUNDS = 8

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const otp = generateSignupOtp()
    const codeHash = await bcrypt.hash(otp, OTP_ROUNDS)
    const passwordHash = await bcrypt.hash(password, 12)
    const expiresAt = new Date(Date.now() + OTP_MINUTES * 60 * 1000)

    await db.signupPending.deleteMany({ where: { email } })
    await db.signupPending.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        codeHash,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
    })

    await sendSignupOtpEmail(email, otp, OTP_MINUTES)

    return NextResponse.json({ ok: true, email, message: 'Check your email for a verification code.' })
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
