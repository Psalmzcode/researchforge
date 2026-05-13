import { db } from '@/lib/db'

const EPS = 0.01

export type OrderFundingCheck = {
  id: string
  projectId: string | null
  clientId: string
}

/**
 * When non-null, the order must not move to IN_PROGRESS (assign or status).
 * Requires a linked project, latest approved quote, and the first non-cancelled
 * invoice for that quote to be fully paid (covers FULL and first INSTALLMENT).
 */
export async function getOrderFundingBlockReason(order: OrderFundingCheck): Promise<string | null> {
  if (!order.projectId) {
    return 'Link this order to the client’s project before starting work. Work is released only after the project’s initial invoice is paid. Use “Linked project” below or ask the client to resubmit with a project selected.'
  }

  const project = await db.project.findUnique({
    where: { id: order.projectId },
    select: { id: true, clientId: true },
  })
  if (!project) {
    return 'The linked project was not found. Set a valid project on this order.'
  }
  if (project.clientId !== order.clientId) {
    return 'The linked project belongs to a different client than this order. Choose a project owned by this order’s client.'
  }

  const quote = await db.quote.findFirst({
    where: { projectId: order.projectId, approved: true },
    orderBy: [{ approvedAt: 'desc' }, { createdAt: 'desc' }],
  })
  if (!quote) {
    return 'There is no approved quote for this project. Approve a quote (which creates the first invoice) before assigning work.'
  }

  const invoices = await db.invoice.findMany({
    where: {
      quoteId: quote.id,
      status: { not: 'CANCELLED' },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (invoices.length === 0) {
    return 'No invoice exists for the approved quote. Re-approve the quote or contact finance.'
  }

  const first = invoices[0]
  if (first.amountPaid < first.amount - EPS) {
    return 'The client must pay the project’s initial invoice in full before work can start. They pay from Client → Invoices, or finance records an off-gateway payment.'
  }

  return null
}
