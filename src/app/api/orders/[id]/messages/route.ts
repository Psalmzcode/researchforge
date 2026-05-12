import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createNotification } from '@/lib/notifications'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const messages = await db.orderMessage.findMany({
    where: { orderId: params.id, ...(user.role === 'CLIENT' ? { isInternal: false } : {}) },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const { message, isInternal } = z.object({ message: z.string().min(1), isInternal: z.boolean().default(false) }).parse(await req.json())

  const msg = await db.orderMessage.create({
    data: { orderId: params.id, userId: user.id, message, isInternal: isInternal && user.role !== 'CLIENT' },
    include: { user: { select: { name: true, role: true } } },
  })

  const order = await db.order.findUnique({ where: { id: params.id }, select: { clientId: true, assignedTo: true, orderNumber: true } })
  if (order && user.id !== order.clientId && !isInternal) {
    await createNotification(order.clientId, 'New Message', `Reply on order ${order.orderNumber}`, 'info', `/dashboard/client/orders/${params.id}`)
  }
  if (order && order.assignedTo && user.id !== order.assignedTo) {
    await createNotification(order.assignedTo, 'New Message', `Message on order ${order.orderNumber}`, 'info', `/dashboard/researcher/orders/${params.id}`)
  }
  return NextResponse.json(msg, { status: 201 })
}
