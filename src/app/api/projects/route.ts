import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { parseJsonBody } from '@/lib/api-error'

const postSchema = z.object({
  title: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().min(2, 'Project title must be at least 2 characters.')),
  description: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().optional()),
  service: z.enum(['RESEARCH', 'DIGITAL_SURVEY', 'SUSTAINABILITY', 'ADVISORY']),
  clientId: z.string().cuid('Select a valid client.'),
  dueDate: z.string().optional(),
  budget: z.number().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  const projects = await db.project.findMany({
    where:
      user.role === 'CLIENT'
        ? { clientId: user.id }
        : user.role === 'RESEARCHER'
          ? { assignments: { some: { userId: user.id } } }
          : {},
    include: {
      client: { select: { name: true, email: true, organization: true } },
      invoices: true,
      assignments: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = parseJsonBody(postSchema, await req.json())
  if (!parsed.ok) return parsed.response
  const data = parsed.data

  const project = await db.project.create({
    data: {
      title: data.title,
      description: data.description?.trim() || undefined,
      service: data.service,
      clientId: data.clientId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      budget: data.budget ?? undefined,
    },
    include: { client: true },
  })
  await db.activity.create({
    data: { projectId: project.id, userId: user.id, action: 'Project created', detail: project.title },
  })
  return NextResponse.json(project, { status: 201 })
}
