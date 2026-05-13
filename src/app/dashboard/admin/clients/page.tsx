import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { ClientWatermarkedToggle } from '@/components/dashboard/ClientWatermarkedToggle'

export default async function AdminClientsPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const clients = await db.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      organization: true,
      createdAt: true,
      allowWatermarkedDeliverableDownload: true,
      _count: { select: { projects: true, orders: true, invoices: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-2xl font-bold">Clients</h1>
      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>All registered client accounts</p></div>
      <div className="overflow-x-auto rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <table className="w-full min-w-[800px] text-sm">
          <thead><tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
            {['Client','Email','Organization','Preview DL','Projects','Orders','Invoices','Joined'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(0,198,162,.15)', color: 'var(--accent)' }}>{(c.name || 'C')[0]}</div>
                    <span className="font-medium">{c.name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{c.email}</td>
                <td className="px-4 py-3 text-xs">{c.organization || '—'}</td>
                <td className="px-4 py-3">
                  <ClientWatermarkedToggle clientId={c.id} initial={c.allowWatermarkedDeliverableDownload} />
                </td>
                <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--accent)' }}>{c._count.projects}</td>
                <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--accent)' }}>{c._count.orders}</td>
                <td className="px-4 py-3 text-center text-xs font-bold">{c._count.invoices}</td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {clients.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No clients yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
