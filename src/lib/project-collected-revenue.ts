import { db } from '@/lib/db'

/** Sum of `amountPaid` on invoices in PAID status for this project (cash collected, not budget). */
export async function getProjectCollectedRevenue(projectId: string): Promise<number> {
  const agg = await db.invoice.aggregate({
    where: { projectId, status: 'PAID' },
    _sum: { amountPaid: true },
  })
  return agg._sum.amountPaid ?? 0
}
