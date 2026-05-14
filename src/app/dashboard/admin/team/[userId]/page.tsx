import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { AdminTeamMemberForm } from '@/components/dashboard/AdminTeamMemberForm'

const STAFF = ['ADMIN', 'RESEARCHER', 'FINANCE'] as const

export default async function AdminTeamMemberEditPage({ params }: { params: { userId: string } }) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')
  const me = session.user as any

  const member = await db.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      phone: true,
      payoutBankName: true,
      payoutAccountNumber: true,
      payoutAccountHolder: true,
    },
  })
  if (!member) notFound()
  if (!STAFF.includes(member.role as (typeof STAFF)[number])) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard/admin/team" className="text-xs" style={{ color: 'var(--muted)' }}>
          ← Team
        </Link>
        <h1 className="font-serif text-2xl font-bold mt-1">Edit team member</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {member.email}
        </p>
      </div>
      <div className="rounded-2xl border p-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <AdminTeamMemberForm
          userId={member.id}
          initialName={member.name}
          initialOrganization={member.organization}
          initialPhone={member.phone}
          initialRole={member.role as 'ADMIN' | 'RESEARCHER' | 'FINANCE'}
          initialPayoutBankName={member.payoutBankName}
          initialPayoutAccountNumber={member.payoutAccountNumber}
          initialPayoutAccountHolder={member.payoutAccountHolder}
          isSelf={member.id === me.id}
        />
      </div>
    </div>
  )
}
