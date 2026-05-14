import { db } from './db'

export async function createNotification(userId: string, title: string, message: string, type: 'info'|'success'|'warning'|'error' = 'info', link?: string) {
  return db.notification.create({ data: { userId, title, message, type, link } })
}

/** In-app alerts for the operator dashboard. This deployment assumes a single ADMIN account (not FINANCE). */
export async function notifyAdmins(title: string, message: string, link?: string) {
  const admins = await db.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } })
  await Promise.all(admins.map((a) => createNotification(a.id, title, message, 'info', link)))
}
