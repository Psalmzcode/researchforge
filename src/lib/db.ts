import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  heartbeatTimer: ReturnType<typeof setInterval> | undefined
}

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
    datasourceUrl: process.env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

const HEARTBEAT_INTERVAL_MS = 4 * 60 * 1000 // 4 minutes

function startHeartbeat() {
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
