import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { AdminStaffInvite } from '@/components/dashboard/AdminStaffInvite'

const roleColors: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: 'rgba(55,138,221,.12)', color: '#378add' },
  RESEARCHER: { bg: 'rgba(240,165,0,.12)', color: '#f0a500' },
  FINANCE: { bg: 'rgba(226,75,74,.12)', color: '#e24b4a' },
  CLIENT: { bg: 'rgba(0,198,162,.12)', color: '#00c6a2' },
}

export default async function AdminTeamPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const team = await db.user.findMany({
    where: { role: { in: ['ADMIN', 'RESEARCHER', 'FINANCE'] } },
    include: {
      _count: { select: { assignments: true, assignedOrders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const researchers = team.filter(u => u.role === 'RESEARCHER')
  const admins = team.filter(u => u.role === 'ADMIN')
  const finance = team.filter(u => u.role === 'FINANCE')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Team Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Internal staff and researcher accounts</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {[
          ['Admin', admins.length, '#378add'],
          ['Researchers', researchers.length, '#f0a500'],
          ['Finance', finance.length, '#e24b4a'],
        ].map(([label, count, color]) => (
          <div key={label as string} className="rounded-2xl border p-4 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="text-2xl font-bold" style={{ color: color as string }}>{count}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <AdminStaffInvite />

      <div className="overflow-x-auto rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Member</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Organization</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Assignments</th>
              <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>Joined</th>
              <th className="text-right px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map(u => {
              const rc = roleColors[u.role] || roleColors.CLIENT
              return (
                <tr key={u.id} className="border-b last:border-0 hover:bg-[rgba(255,255,255,.02)]" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: rc.bg, color: rc.color }}>
                        {(u.name || 'U')[0]}
                      </div>
                      <span className="font-medium">{u.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-[.7rem] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: rc.bg, color: rc.color }}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{u.organization || '—'}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: 'var(--accent)' }}>{u._count.assignments + u._count.assignedOrders}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/team/${u.id}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:border-[var(--accent)]"
                      style={{ borderColor: 'var(--card-border)', color: 'var(--accent)' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            {team.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>No team members yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
