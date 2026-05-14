import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency } from '@/lib/utils'

export default async function FinancePayoutsPage() {
  const session = await auth()
  if (!session || !['FINANCE', 'ADMIN'].includes((session.user as any).role)) redirect('/login')

  const projects = await db.project.findMany({
    include: {
      client: { select: { name: true, organization: true } },
      invoices: { where: { status: 'PAID' }, select: { amountPaid: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 80,
  })

  const rows = projects.map((proj) => ({
    ...proj,
    collected: proj.invoices.reduce((s, i) => s + i.amountPaid, 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Staff payouts</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Payouts are calculated from each <strong>project&apos;s paid invoices</strong> (cash in), not budget. Open a
          project to set shares, see the sample math, and record payments.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Project</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Collected</th>
              <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{row.title}</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
                    {row.id.slice(0, 8)}…
                  </p>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                  {row.client.organization || row.client.name}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 text-xs font-medium">{formatCurrency(row.collected)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/finance/projects/${row.id}`}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:border-[var(--accent)]"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--accent)' }}
                  >
                    Payouts
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  No projects yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
