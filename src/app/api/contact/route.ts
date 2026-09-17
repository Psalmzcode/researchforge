import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendContactInquiry } from '@/lib/email'

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  organisation: z.string().trim().max(200).optional().or(z.literal('')),
  purpose: z.string().trim().min(10).max(4000),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 })
    }

    const { name, email, organisation, purpose } = parsed.data
    await sendContactInquiry({
      name,
      email,
      organisation: organisation?.trim() || undefined,
      purpose,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact]', error)
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  }
}
