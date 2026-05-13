import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'
import { orderMessageAccessResult } from '@/lib/order-message-access'

const patchSchema = z.object({
  message: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(1, 'Message cannot be empty.')),
})

const EDIT_MS = 15 * 60 * 1000

export async function PATCH(req: NextRequest, { params }: { params: { id: string; messageId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const gate = await orderMessageAccessResult(params.id, user)
  if (gate === 'notfound') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (gate === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(patchSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const { message: text } = parsed.data

  const existing = await db.orderMessage.findFirst({
    where: { id: params.messageId, orderId: params.id, deletedAt: null },
  })
  if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  if (user.role === 'CLIENT' && existing.isInternal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (existing.userId !== user.id) {
    return NextResponse.json({ error: 'You can only edit your own messages.' }, { status: 403 })
  }

  if (Date.now() - new Date(existing.createdAt).getTime() > EDIT_MS) {
    return NextResponse.json({ error: 'This message is too old to edit (15 minute limit).' }, { status: 400 })
  }

  const msg = await db.orderMessage.update({
    where: { id: existing.id },
    data: { message: text, editedAt: new Date() },
    include: { user: { select: { name: true, role: true } } },
  })
  return NextResponse.json(msg)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; messageId: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const gate = await orderMessageAccessResult(params.id, user)
  if (gate === 'notfound') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (gate === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const existing = await db.orderMessage.findFirst({
    where: { id: params.messageId, orderId: params.id, deletedAt: null },
  })
  if (!existing) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  if (user.role === 'CLIENT' && existing.isInternal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const isAuthor = existing.userId === user.id
  if (!isAuthor && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'You can only delete your own messages.' }, { status: 403 })
  }

  await db.orderMessage.update({
    where: { id: existing.id },
    data: { deletedAt: new Date() },
  })
  return NextResponse.json({ ok: true })
}
