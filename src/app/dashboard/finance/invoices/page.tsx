import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SendInvoiceButton } from '@/components/dashboard/SendInvoiceButton'

export default async function FinanceInvoicesPage() {
  const session = await auth()
  if (!session || !['FINANCE','ADMIN'].includes((session.user as any).role)) redirect('/login')

  const invoices = await db.invoice.findMany({
    include: {
      project: { select: { title: true, service: true } },
      client: { select: { name: true, email: true, organization: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((a, i) => a + i.amountPaid, 0)
  const outstanding = invoices.filter(i => !['PAID','CANCELLED'].includes(i.status)).reduce((a, i) => a + (i.amount - i.amountPaid), 0)
  const overdue = invoices.filter(i => i.status === 'OVERDUE')

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl font-bold">Invoice Management</h1>
      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Track payments, send invoices, manage collections</p></div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          ['Total Invoices', invoices.length, '', ''],
          ['Paid', invoices.filter(i=>i.status==='PAID').length, formatCurrency(totalRevenue), 'up'],
          ['Outstanding', invoices.filter(i=>!['PAID','CANCELLED'].includes(i.status)).length, formatCurrency(outstanding), 'down'],
          ['Overdue', overdue.length, overdue.length > 0 ? 'Needs action' : 'All clear', overdue.length > 0 ? 'down' : 'up'],
        ].map(([l, n, sub, col]) => (
          <div key={l as string} className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{l}</div>
            <div className="font-serif text-2xl font-bold">{n}</div>
            {sub && <div className="text-xs mt-0.5" style={{ color: col === 'up' ? 'var(--accent)' : col === 'down' ? '#e24b4a' : 'var(--muted)' }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead><tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              {['Invoice','Client','Project','Amount','Paid','Type','Due','Status',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)] transition-colors" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>{inv.number}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{inv.client.organization || inv.client.name}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{inv.client.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.project.title}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{formatCurrency(inv.amountPaid)}</div>
                    {inv.amount > inv.amountPaid && <div className="text-xs" style={{ color: '#e24b4a' }}>bal: {formatCurrency(inv.amount - inv.amountPaid)}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.paymentType}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    {['SENT','OVERDUE'].includes(inv.status) && (
                      <SendInvoiceButton invoiceId={inv.id} clientEmail={inv.client.email} />
                    )}
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
