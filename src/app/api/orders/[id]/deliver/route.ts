import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { uploadFile, generateFileKey } from '@/lib/storage'
import { notifyAdmins } from '@/lib/notifications'
import { sendDeliverablesForReview } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (!['ADMIN','RESEARCHER'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  const order = await db.order.findUnique({ where: { id: params.id }, include: { client: true } })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (user.role === 'RESEARCHER') {
    if (order.assignedTo !== user.id) {
      return NextResponse.json({ error: 'You are not assigned to this order.' }, { status: 403 })
    }
    if (order.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Deliverables can only be uploaded while the order is in progress (after admin assignment).' },
        { status: 400 },
      )
    }
  }

  const saved: { name: string; url: string }[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const key = generateFileKey(`deliverables/${order.orderNumber}`, file.name)
    const url = await uploadFile(buffer, key, file.type)

    await db.deliverable.create({
      data: { orderId: order.id, name: file.name, url, size: file.size, type: file.type, uploadedBy: user.id },
    })
    saved.push({ name: file.name, url })
  }

  // Move to PENDING_REVIEW — admin must approve before client is notified
  await db.order.update({ where: { id: params.id }, data: { status: 'PENDING_REVIEW' } })
  await db.orderTimeline.create({ data: { orderId: order.id, status: 'PENDING_REVIEW', note: `${files.length} deliverable(s) uploaded — awaiting admin review`, userId: user.id } })

  // Email admins with deliverable files attached + dashboard notification
  const admins = await db.user.findMany({ where: { role: 'ADMIN' }, select: { email: true } })
  const adminEmails = admins.map(a => a.email)
  const deliverableRefs = saved.map((s, i) => ({ ...s, size: files[i]?.size ?? 0 }))
  if (adminEmails.length > 0) {
    await sendDeliverablesForReview(adminEmails, order.orderNumber, user.name || 'Researcher', deliverableRefs)
  }
  await notifyAdmins('Deliverables Uploaded', `${order.orderNumber}: ${saved.length} file(s) ready for review`, `/dashboard/admin/orders/${order.id}`)

  return NextResponse.json({ delivered: saved.length, files: saved })
}
