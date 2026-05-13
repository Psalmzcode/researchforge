import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'

const patchSchema = z.object({
  projectId: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.union([z.string().cuid('Invalid project.'), z.null()]),
  ),
})

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
      messages: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
        where: { deletedAt: null, ...(user.role === 'CLIENT' ? { isInternal: false } : {}) },
      },
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
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(patchSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const { projectId } = parsed.data

  const current = await db.order.findUnique({
    where: { id: params.id },
    select: { id: true, clientId: true },
  })
  if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (projectId !== null) {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (project.clientId !== current.clientId) {
      return NextResponse.json({ error: 'That project belongs to a different client.' }, { status: 400 })
    }
  }

  const order = await db.order.update({
    where: { id: params.id },
    data: { projectId },
    include: { client: true },
  })
  return NextResponse.json(order)
}
