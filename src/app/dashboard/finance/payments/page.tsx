import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function FinancePaymentsPage() {
  const session = await auth()
  if (!session || !['FINANCE', 'ADMIN'].includes((session.user as any).role)) redirect('/login')

  const payments = await db.payment.findMany({
    include: {
      invoice: {
        include: {
          client: { select: { name: true, organization: true, email: true } },
          project: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalReceived = payments.filter(p => p.status === 'success').reduce((a, p) => a + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending')
  const failed = payments.filter(p => p.status === 'failed')

  const statusStyle: Record<string, { bg: string; color: string }> = {
    success: { bg: 'rgba(0,198,162,.1)', color: '#00c6a2' },
    pending: { bg: 'rgba(240,165,0,.1)', color: '#f0a500' },
    failed: { bg: 'rgba(226,75,74,.1)', color: '#e24b4a' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Payment Records</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All payment transactions across invoices</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          ['Total Payments', payments.length, '', ''],
          ['Received', payments.filter(p => p.status === 'success').length, formatCurrency(totalReceived), 'up'],
          ['Pending', pending.length, pending.length > 0 ? 'Awaiting confirmation' : 'All clear', pending.length > 0 ? 'down' : 'up'],
          ['Failed', failed.length, failed.length > 0 ? 'Needs attention' : 'None', failed.length > 0 ? 'down' : 'up'],
        ].map(([l, n, sub, col]) => (
          <div key={l as string} className="rounded-2xl border p-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{l}</div>
            <div className="font-serif text-2xl font-bold">{n}</div>
            {sub && <div className="text-xs mt-0.5" style={{ color: col === 'up' ? 'var(--accent)' : col === 'down' ? '#e24b4a' : 'var(--muted)' }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              {['Reference', 'Client', 'Project', 'Amount', 'Gateway', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const ss = statusStyle[p.status] || statusStyle.pending
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>{p.reference.slice(0, 14)}…</td>
                  <td className="px-4 py-3 text-xs">{p.invoice.client.organization || p.invoice.client.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{p.invoice.project.title}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-xs capitalize">{p.gateway}</td>
                  <td className="px-4 py-3">
                    <span className="text-[.7rem] font-semibold px-2.5 py-0.5 rounded-full capitalize" style={{ background: ss.bg, color: ss.color }}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{formatDate(p.createdAt)}</td>
                </tr>
              )
            })}
            {payments.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No payments recorded yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
