import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  const notifications = await db.notification.findMany({
    where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20,
  })
  return NextResponse.json(notifications)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  await db.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } })
  return NextResponse.json({ ok: true })
}
