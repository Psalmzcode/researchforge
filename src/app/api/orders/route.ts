import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { sendOrderConfirmation, sendNewOrderToAdmins } from '@/lib/email'
import { notifyAdmins } from '@/lib/notifications'
import { parseJsonBody } from '@/lib/api-error'

function orderNum() { return `ORD-${Date.now().toString().slice(-6)}` }

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any

  const where = user.role === 'CLIENT' ? { clientId: user.id }
    : user.role === 'RESEARCHER' ? { assignedTo: user.id }
    : {}

  const orders = await db.order.findMany({
    where,
    include: {
      client: { select: { name: true, email: true, organization: true } },
      assignee: { select: { name: true } },
      briefFiles: true,
      deliverables: true,
      timeline: { orderBy: { createdAt: 'asc' } },
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

const schema = z.object({
  title: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(3, 'Project title must be at least 3 characters.')),
  description: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(20, 'Project description must be at least 20 characters.')),
  service: z.enum(['RESEARCH', 'DIGITAL_SURVEY', 'SUSTAINABILITY', 'ADVISORY']),
  deliveryMethod: z.enum(['DOWNLOAD','EMAIL','BOTH']).default('BOTH'),
  deliveryEmail: z.string().email().optional().or(z.literal('')),
  deadline: z.string().optional(),
  budget: z.number().optional(),
  priority: z.enum(['low','normal','high','urgent']).default('normal'),
  notes: z.string().optional(),
  projectId: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().cuid().optional(),
  ),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['CLIENT','ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = parseJsonBody(schema, body)
  if (!parsed.ok) return parsed.response
  const data = parsed.data

  const order = await db.order.create({
    data: {
      orderNumber: orderNum(),
      clientId: user.id,
      title: data.title,
      description: data.description,
      service: data.service,
      deliveryMethod: data.deliveryMethod,
      deliveryEmail: data.deliveryEmail?.trim() || undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      budget: data.budget ?? undefined,
      priority: data.priority,
      notes: data.notes?.trim() || undefined,
      ...(data.projectId ? { projectId: data.projectId } : {}),
    },
    include: { client: true },
  })

  await db.orderTimeline.create({ data: { orderId: order.id, status: 'SUBMITTED', note: 'Order submitted by client', userId: user.id } })
  await db.activity.create({ data: { userId: user.id, action: 'Order submitted', detail: order.title } })

  // Email client confirmation
  await sendOrderConfirmation(order.client.email, order.client.name || 'Client', order.orderNumber)

  // Fetch brief files for this order (may have been attached separately)
  const briefFiles = await db.orderBrief.findMany({ where: { orderId: order.id } })
  const briefs = briefFiles.map(f => ({ name: f.name, url: f.url, size: f.size }))

  // Email admins with brief files attached + dashboard notification
  const admins = await db.user.findMany({ where: { role: 'ADMIN' }, select: { email: true } })
  const adminEmails = admins.map(a => a.email)
  if (adminEmails.length > 0) {
    await sendNewOrderToAdmins(adminEmails, order.orderNumber, order.title, order.client.name || 'Client', briefs)
  }
  await notifyAdmins('New Order Received', `${order.orderNumber}: ${order.title}`, `/dashboard/admin/orders/${order.id}`)

  return NextResponse.json(order, { status: 201 })
}
