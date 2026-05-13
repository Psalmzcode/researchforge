import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  heartbeatTimer: ReturnType<typeof setInterval> | undefined
}

/** Cold or distant Postgres (e.g. Neon) can take >15s to connect; Prisma's default pool timeout then fails login. */
function databaseUrlWithTimeouts(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return raw
  const minPoolSeconds = 60
  const minConnectSeconds = 60
  try {
    const u = new URL(raw)
    const pool = Number(u.searchParams.get('pool_timeout'))
    if (!u.searchParams.has('pool_timeout') || Number.isFinite(pool) === false || pool < minPoolSeconds) {
      u.searchParams.set('pool_timeout', String(minPoolSeconds))
    }
    const connect = Number(u.searchParams.get('connect_timeout'))
    if (!u.searchParams.has('connect_timeout') || Number.isFinite(connect) === false || connect < minConnectSeconds) {
      u.searchParams.set('connect_timeout', String(minConnectSeconds))
    }
    return u.toString()
  } catch {
    return raw
  }
}

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
    datasourceUrl: databaseUrlWithTimeouts(process.env.DATABASE_URL),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000 // 4 minutes

/** Avoid touching the DB during `next build` (e.g. Vercel) — prevents Prisma errors while collecting route data. */
const isNextBuild = process.env.NEXT_PHASE === 'phase-production-build'

function startHeartbeat() {
  if (isNextBuild) return
  if (globalForPrisma.heartbeatTimer) return
  globalForPrisma.heartbeatTimer = setInterval(async () => {
    try {
      await db.$queryRaw`SELECT 1`
    } catch {
      // Connection lost — Prisma will auto-reconnect on next real query
    }
  }, HEARTBEAT_INTERVAL_MS)

  if (globalForPrisma.heartbeatTimer.unref) {
    globalForPrisma.heartbeatTimer.unref()
  }
}

startHeartbeat()
