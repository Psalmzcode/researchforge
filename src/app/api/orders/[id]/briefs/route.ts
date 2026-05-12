import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { files } = await req.json()
  if (!files?.length) return NextResponse.json({ ok: true })

  const created = await Promise.all(
    files.map((f: { name: string; url: string; size: number; type: string }) =>
      db.orderBrief.create({ data: { orderId: params.id, name: f.name, url: f.url, size: f.size, type: f.type } })
    )
  )
  return NextResponse.json(created, { status: 201 })
}
