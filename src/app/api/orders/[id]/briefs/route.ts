import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseJsonBody } from '@/lib/api-error'

const schema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().min(1, 'Each file needs a name.'),
        url: z.string().min(1, 'Each file needs a URL.'),
        size: z.number().int().nonnegative(),
        type: z.string(),
      }),
    )
    .optional()
    .default([]),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = parseJsonBody(schema, await req.json())
  if (!parsed.ok) return parsed.response
  const { files } = parsed.data

  if (!files?.length) return NextResponse.json({ ok: true })

  const created = await Promise.all(
    files.map((f: { name: string; url: string; size: number; type: string }) =>
      db.orderBrief.create({ data: { orderId: params.id, name: f.name, url: f.url, size: f.size, type: f.type } }),
    ),
  )
  return NextResponse.json(created, { status: 201 })
}
