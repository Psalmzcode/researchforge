import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/api-error'

const schema = z.object({
  name: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(2, 'Name must be at least 2 characters.')),
  organization: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().optional()),
  email: z.preprocess((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v), z.string().email('Enter a valid email address.')),
  service: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().optional()),
  message: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(10, 'Message must be at least 10 characters.')),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = parseJsonBody(schema, body)
    if (!parsed.ok) return parsed.response
    await db.contactRequest.create({ data: parsed.data })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not save your message. Try again later.' }, { status: 500 })
  }
}
