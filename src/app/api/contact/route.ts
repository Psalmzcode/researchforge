import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
const schema = z.object({ name:z.string().min(2), organization:z.string().optional(), email:z.string().email(), service:z.string().optional(), message:z.string().min(10) })
export async function POST(req: NextRequest) {
  try { const data = schema.parse(await req.json()); await db.contactRequest.create({ data }); return NextResponse.json({ ok: true }) }
  catch { return NextResponse.json({ error: 'Invalid data' }, { status: 400 }) }
}
