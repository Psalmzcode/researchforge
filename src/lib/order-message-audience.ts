import type { Prisma } from '@prisma/client'
import type { OrderMessageAudience } from '@prisma/client'

export function audienceForNewMessage(input: {
  userRole: string
  adminAudience?: 'CLIENT' | 'RESEARCHER'
}): OrderMessageAudience {
  if (input.userRole === 'RESEARCHER') return 'RESEARCHER_ADMIN'
  if (input.userRole === 'CLIENT') return 'CLIENT_ADMIN'
  if (input.userRole === 'ADMIN' && input.adminAudience === 'RESEARCHER') return 'RESEARCHER_ADMIN'
  return 'CLIENT_ADMIN'
}

/** Filters order messages for list/detail APIs and SSR (must match GET /api/orders/[id]/messages). */
export function orderMessageVisibilityWhere(orderId: string, viewerRole: string): Prisma.OrderMessageWhereInput {
  const base: Prisma.OrderMessageWhereInput = { orderId, deletedAt: null }
  switch (viewerRole) {
    case 'ADMIN':
      return base
    case 'CLIENT':
      return { ...base, isInternal: false, audience: 'CLIENT_ADMIN' }
    case 'RESEARCHER':
      return { ...base, isInternal: false, audience: 'RESEARCHER_ADMIN' }
    default:
      return { ...base, id: '__no_message_access__' }
  }
}
