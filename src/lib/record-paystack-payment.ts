import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { releaseHeldOrdersAfterPayment } from '@/lib/order-release'

const EPS = 0.01

function isUniqueConstraintError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
}

/**
 * Idempotent: same Paystack `reference` only applies once. Used by webhook and return-url verify.
 */
export async function recordPaystackSuccessfulPayment(params: {
  reference: string
  amountKobo: number
  invoiceId: string
  metadata?: Record<string, unknown>
}): Promise<{ ok: true; alreadyRecorded: boolean } | { ok: false; reason: 'invoice_not_found' }> {
  const amount = params.amountKobo / 100
  if (amount <= 0) return { ok: false, reason: 'invoice_not_found' }

  let alreadyRecorded = false
  let invoiceProjectId: string | null = null
  let invoiceClientId: string | null = null
  let becamePaid = false

  try {
    await db.$transaction(async (tx) => {
      const dup = await tx.payment.findUnique({ where: { reference: params.reference } })
      if (dup) {
        alreadyRecorded = true
        return
      }

      const invoiceRow = await tx.invoice.findUnique({ where: { id: params.invoiceId } })
      if (!invoiceRow) {
        throw new Error('INVOICE_NOT_FOUND')
      }

      const newPaid = Math.min(invoiceRow.amountPaid + amount, invoiceRow.amount)
      const isPaid = newPaid >= invoiceRow.amount - EPS

      await tx.payment.create({
        data: {
          invoiceId: params.invoiceId,
          amount,
          reference: params.reference,
          gateway: 'paystack',
          status: 'success',
          metadata: (params.metadata ?? {}) as object,
        },
      })

      await tx.invoice.update({
        where: { id: params.invoiceId },
        data: {
          amountPaid: newPaid,
          status: isPaid ? 'PAID' : 'SENT',
          paidAt: isPaid ? new Date() : undefined,
          paystackRef: params.reference,
        },
      })

      invoiceProjectId = invoiceRow.projectId
      invoiceClientId = invoiceRow.clientId
      becamePaid = isPaid
    })
  } catch (e) {
    if (isUniqueConstraintError(e)) {
      return { ok: true, alreadyRecorded: true }
    }
    if (e instanceof Error && e.message === 'INVOICE_NOT_FOUND') {
      return { ok: false, reason: 'invoice_not_found' }
    }
    throw e
  }

  if (alreadyRecorded) {
    return { ok: true, alreadyRecorded: true }
  }

  if (becamePaid && invoiceProjectId && invoiceClientId) {
    await db.project.update({ where: { id: invoiceProjectId }, data: { status: 'ACTIVE' } })
    await releaseHeldOrdersAfterPayment(invoiceClientId, invoiceProjectId)
  }

  if (invoiceProjectId) {
    await db.activity.create({
      data: {
        projectId: invoiceProjectId,
        action: 'Payment received',
        detail: `₦${amount.toLocaleString()} via Paystack`,
      },
    })
  }

  return { ok: true, alreadyRecorded: false }
}
