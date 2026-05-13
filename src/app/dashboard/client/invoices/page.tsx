import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PayNowButton } from '@/components/dashboard/PayNowButton'

export default async function ClientInvoicesPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const invoices = await db.invoice.findMany({
    where: { clientId: user.id },
    include: { project: { select: { title: true, service: true } }, payments: true },
    orderBy: { createdAt: 'desc' },
  })

  const totalDue = invoices.filter(i => !['PAID','CANCELLED'].includes(i.status)).reduce((a, i) => a + (i.amount - i.amountPaid), 0)
  const totalPaid = invoices.reduce((a, i) => a + i.amountPaid, 0)

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl font-bold">Invoices & Payments</h1>
      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Your billing history and payment status</p></div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Total Invoices</div>
          <div className="font-serif text-2xl font-bold">{invoices.length}</div>
        </div>
        <div className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Total Paid</div>
          <div className="font-serif text-2xl font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(totalPaid)}</div>
        </div>
        <div className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Outstanding</div>
          <div className="font-serif text-2xl font-bold" style={{ color: totalDue > 0 ? '#e24b4a' : 'var(--accent)' }}>{formatCurrency(totalDue)}</div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead><tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              {['Invoice','Project','Amount','Paid','Balance','Type','Due Date','Status',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--accent)' }}>{inv.number}</td>
                  <td className="px-4 py-3 text-xs max-w-[150px] truncate">{inv.project.title}</td>
                  <td className="px-4 py-3 text-xs font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--accent)' }}>{formatCurrency(inv.amountPaid)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: inv.amount > inv.amountPaid ? '#e24b4a' : 'var(--muted)' }}>{formatCurrency(inv.amount - inv.amountPaid)}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.paymentType}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    {['SENT','OVERDUE'].includes(inv.status) && <PayNowButton invoiceId={inv.id} />}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
