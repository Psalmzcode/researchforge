import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AdminProjectBilling, type InvoiceRow, type QuoteRow } from '@/components/dashboard/AdminProjectBilling'

export default async function AdminProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, organization: true, email: true } },
      quotes: { orderBy: { createdAt: 'desc' } },
      invoices: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!project) notFound()

  const quotes: QuoteRow[] = project.quotes.map((q) => ({
    id: q.id,
    amount: q.amount,
    description: q.description,
    paymentType: q.paymentType,
    approved: q.approved,
    approvedAt: q.approvedAt?.toISOString() ?? null,
    createdAt: q.createdAt.toISOString(),
    validUntil: q.validUntil?.toISOString() ?? null,
  }))

  const invoices: InvoiceRow[] = project.invoices.map((i) => ({
    id: i.id,
    number: i.number,
    amount: i.amount,
    amountPaid: i.amountPaid,
    status: i.status,
    paymentType: i.paymentType,
    dueDate: i.dueDate?.toISOString() ?? null,
    quoteId: i.quoteId,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/admin/projects" className="text-xs" style={{ color: 'var(--muted)' }}>
          ← All projects
        </Link>
        <h1 className="font-serif text-2xl font-bold mt-1">{project.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={project.status} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {project.service.replace('_', ' ')}
          </span>
          {project.dueDate && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Due {formatDate(project.dueDate)}
            </span>
          )}
          {project.budget != null && (
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
              Budget {formatCurrency(project.budget)}
            </span>
          )}
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
          Client:{' '}
          <strong>{project.client.organization || project.client.name}</strong> ({project.client.email})
        </p>
        {project.description && (
          <p className="text-sm mt-3 leading-relaxed border-t pt-3" style={{ borderColor: 'var(--card-border)' }}>
            {project.description}
          </p>
        )}
      </div>

      <AdminProjectBilling projectId={project.id} initialQuotes={quotes} initialInvoices={invoices} />
    </div>
  )
}
