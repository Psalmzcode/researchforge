import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SendInvoiceButton } from '@/components/dashboard/SendInvoiceButton'

export default async function AdminInvoicesPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const invoices = await db.invoice.findMany({
    include: {
      project: { select: { title: true } },
      client: { select: { name: true, email: true, organization: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl font-bold">Invoices</h1>
      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All project invoices and payment status</p></div>
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              {['Invoice #','Client','Project','Amount','Paid','Balance','Type','Due','Status',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>{inv.number}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{inv.client.organization || inv.client.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{inv.client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[140px] truncate" style={{ color: 'var(--muted)' }}>{inv.project.title}</td>
                  <td className="px-4 py-3 text-xs font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--accent)' }}>{formatCurrency(inv.amountPaid)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: inv.amount > inv.amountPaid ? '#e24b4a' : 'var(--muted)' }}>{formatCurrency(inv.amount - inv.amountPaid)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.paymentType}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    {['SENT','OVERDUE'].includes(inv.status) && <SendInvoiceButton invoiceId={inv.id} clientEmail={inv.client.email} />}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={10} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
