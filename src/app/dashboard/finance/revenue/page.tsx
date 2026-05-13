import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function FinanceRevenuePage() {
  const session = await auth()
  if (!session || !['FINANCE', 'ADMIN'].includes((session.user as any).role)) redirect('/login')

  const invoices = await db.invoice.findMany({
    where: { status: 'PAID' },
    include: {
      project: { select: { title: true, service: true } },
      client: { select: { name: true, organization: true } },
      payments: true,
    },
    orderBy: { paidAt: 'desc' },
  })

  const totalRevenue = invoices.reduce((a, i) => a + i.amountPaid, 0)

  const byService: Record<string, number> = {}
  invoices.forEach(i => { byService[i.project.service] = (byService[i.project.service] || 0) + i.amountPaid })
  const serviceTotal = Object.values(byService).reduce((a, b) => a + b, 0) || 1
  const serviceColors: Record<string, string> = { RESEARCH: 'var(--accent)', DIGITAL_SURVEY: '#f0a500', SUSTAINABILITY: '#378add', ADVISORY: '#d4537e' }

  const byClient: Record<string, { name: string; total: number; count: number }> = {}
  invoices.forEach(i => {
    const key = i.client.organization || i.client.name || 'Unknown'
    if (!byClient[key]) byClient[key] = { name: key, total: 0, count: 0 }
    byClient[key].total += i.amountPaid
    byClient[key].count++
  })
  const topClients = Object.values(byClient).sort((a, b) => b.total - a.total).slice(0, 5)

  const byMonth: Record<string, number> = {}
  invoices.forEach(i => {
    if (i.paidAt) {
      const key = `${i.paidAt.getFullYear()}-${String(i.paidAt.getMonth() + 1).padStart(2, '0')}`
      byMonth[key] = (byMonth[key] || 0) + i.amountPaid
    }
  })
  const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxMonth = Math.max(...months.map(([, v]) => v), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Revenue Report</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Breakdown of all collected revenue</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          ['Total Revenue', formatCurrency(totalRevenue), 'var(--accent)'],
          ['Paid Invoices', invoices.length, '#378add'],
          ['Avg. Invoice', invoices.length ? formatCurrency(totalRevenue / invoices.length) : '$0', '#f0a500'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-2xl border p-4 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: color as string }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Trend */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <h2 className="font-semibold text-sm mb-4">Monthly Revenue</h2>
          {months.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>No data yet</p>
          ) : (
            <div className="space-y-3">
              {months.map(([month, amount]) => (
                <div key={month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--muted)' }}>{month}</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(amount / maxMonth) * 100}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by Service */}
        <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <h2 className="font-semibold text-sm mb-4">Revenue by Service</h2>
          {Object.keys(byService).length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--muted)' }}>No paid invoices yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byService).map(([svc, amt]) => {
                const pct = Math.round((amt / serviceTotal) * 100)
                return (
                  <div key={svc}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--muted)' }}>{svc.replace('_', ' ')}</span>
                      <span style={{ color: serviceColors[svc] || 'var(--accent)' }}>{pct}% · {formatCurrency(amt)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: serviceColors[svc] || 'var(--accent)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Clients */}
      <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <h2 className="font-semibold text-sm mb-4">Top Clients by Revenue</h2>
        {topClients.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>No data yet</p>
        ) : (
          <div className="space-y-2">
            {topClients.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: i === 0 ? 'rgba(0,198,162,.06)' : 'transparent' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(0,198,162,.12)', color: 'var(--accent)' }}>{i + 1}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>{c.count} invoice{c.count !== 1 ? 's' : ''}</span>
                </div>
                <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paid Invoices Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <h2 className="font-semibold text-sm">Paid Invoices</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              {['Invoice', 'Client', 'Service', 'Amount', 'Paid On'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 20).map(inv => (
              <tr key={inv.id} className="border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--accent)' }}>{inv.number}</td>
                <td className="px-4 py-3 text-xs">{inv.client.organization || inv.client.name}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.project.service.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(inv.amountPaid)}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{inv.paidAt ? formatDate(inv.paidAt) : '—'}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No paid invoices yet</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
