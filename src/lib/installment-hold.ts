import { db } from '@/lib/db'
import { generateInvoiceNumber } from '@/lib/utils'

const EPS = 0.01

/** Unpaid balance on installment invoices for this project (any non-cancelled installment line with amount still owed). */
export async function hasInstallmentBalanceForProject(clientId: string, projectId: string): Promise<boolean> {
  const invoices = await db.invoice.findMany({
    where: {
      clientId,
      projectId,
      paymentType: 'INSTALLMENT',
      status: { not: 'CANCELLED' },
    },
  })
  return invoices.some((i) => i.amountPaid < i.amount - EPS)
}

/**
 * When work is approved but payment is held: ensure a final invoice exists for the
 * remaining installment balance (after all existing installment invoices are fully paid).
 */
export async function ensureFinalInstallmentInvoice(clientId: string, projectId: string): Promise<void> {
  const quote = await db.quote.findFirst({
    where: { projectId, approved: true, paymentType: 'INSTALLMENT' },
    orderBy: [{ approvedAt: 'desc' }, { createdAt: 'desc' }],
  })
  if (!quote) return

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project || project.clientId !== clientId) return

  const invoices = await db.invoice.findMany({ where: { quoteId: quote.id } })
  if (invoices.length === 0) return

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0)
  const allExistingPaid = invoices.every((i) => i.amountPaid >= i.amount - EPS)
  const remaining = quote.amount - totalInvoiced

  if (remaining <= EPS || !allExistingPaid) return

  await db.invoice.create({
    data: {
      number: generateInvoiceNumber(),
      projectId: quote.projectId,
      clientId,
      quoteId: quote.id,
      amount: remaining,
      paymentType: 'INSTALLMENT',
      status: 'SENT',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
}
