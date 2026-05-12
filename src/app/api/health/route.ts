import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const start = Date.now()
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latency: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'disconnected',
        error: err.message,
        latency: `${Date.now() - start}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
