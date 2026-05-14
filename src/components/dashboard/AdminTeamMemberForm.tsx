'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getJsonError } from '@/lib/api-error'

type RoleOpt = 'ADMIN' | 'RESEARCHER' | 'FINANCE'

export function AdminTeamMemberForm({
  userId,
  initialName,
  initialOrganization,
  initialPhone,
  initialRole,
  initialPayoutBankName,
  initialPayoutAccountNumber,
  initialPayoutAccountHolder,
  isSelf,
}: {
  userId: string
  initialName: string | null
  initialOrganization: string | null
  initialPhone: string | null
  initialRole: RoleOpt
  initialPayoutBankName?: string | null
  initialPayoutAccountNumber?: string | null
  initialPayoutAccountHolder?: string | null
  isSelf: boolean
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName ?? '')
  const [organization, setOrganization] = useState(initialOrganization ?? '')
  const [phone, setPhone] = useState(initialPhone ?? '')
  const [role, setRole] = useState<RoleOpt>(initialRole)
  const [payoutBankName, setPayoutBankName] = useState(initialPayoutBankName ?? '')
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(initialPayoutAccountNumber ?? '')
  const [payoutAccountHolder, setPayoutAccountHolder] = useState(initialPayoutAccountHolder ?? '')
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          organization: organization.trim() || null,
          phone: phone.trim() || null,
          ...(isSelf ? {} : { role }),
          ...(role === 'RESEARCHER'
            ? {
                payoutBankName: payoutBankName.trim() || null,
                payoutAccountNumber: payoutAccountNumber.trim() || null,
                payoutAccountHolder: payoutAccountHolder.trim() || null,
              }
            : {}),
        }),
      })
      if (res.ok) {
        toast.success('Team member updated.')
        router.push('/dashboard/admin/team')
        router.refresh()
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
          style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
          Organization
        </label>
        <input
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
          style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
          Phone
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
          style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
        />
      </div>
      {role === 'RESEARCHER' && (
        <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Payout bank details (optional)
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            Shown on project payout screens when finance pays this researcher by transfer. Skip if you only pay cash.
          </p>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
              Bank name
            </label>
            <input
              value={payoutBankName}
              onChange={(e) => setPayoutBankName(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
              style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
              Account number
            </label>
            <input
              value={payoutAccountNumber}
              onChange={(e) => setPayoutAccountNumber(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
              style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
              Account name
            </label>
            <input
              value={payoutAccountHolder}
              onChange={(e) => setPayoutAccountHolder(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
              style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
            />
          </div>
        </div>
      )}
      {!isSelf && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOpt)}
            className="w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
            style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="RESEARCHER">RESEARCHER</option>
            <option value="FINANCE">FINANCE</option>
          </select>
        </div>
      )}
      {isSelf && <p className="text-xs" style={{ color: 'var(--muted)' }}>You cannot change your own role here.</p>}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
