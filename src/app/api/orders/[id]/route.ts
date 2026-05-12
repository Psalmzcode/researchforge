import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, email: true, organization: true } },
      assignee: { select: { name: true, email: true } },
      reviewer: { select: { name: true } },
      briefFiles: true,
      deliverables: true,
      messages: { include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' }, where: user.role === 'CLIENT' ? { isInternal: false } : {} },
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (user.role === 'CLIENT' && order.clientId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const order = await db.order.update({ where: { id: params.id }, data: body, include: { client: true } })
  return NextResponse.json(order)
}
