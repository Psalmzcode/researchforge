import crypto from 'crypto'

const PEPPER = () => process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'dev-only-invite-pepper'

/** Deterministic hash for invite URL token (store only this in DB). */
export function hashInviteToken(token: string): string {
  return crypto.createHmac('sha256', PEPPER()).update(token).digest('hex')
}

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateSignupOtp(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}
