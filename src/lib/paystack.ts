const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const BASE = 'https://api.paystack.co'

export async function initializePaystackPayment(params: {
  email: string; amount: number; reference: string; callbackUrl: string; metadata?: Record<string, any>
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // kobo
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })
  return res.json()
}

export async function verifyPaystackPayment(reference: string) {
  const res = await fetch(`${BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })
  return res.json()
}

export function verifyPaystackWebhook(payload: string, signature: string) {
  const crypto = require('crypto')
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!).update(payload).digest('hex')
  return hash === signature
}
