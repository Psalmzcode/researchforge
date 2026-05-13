'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'

export function AdminStaffInvite() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState<'RESEARCHER' | 'FINANCE' | 'ADMIN'>('RESEARCHER')
  const [loading, setLoading] = useState(false)

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          organization: organization.trim() || null,
          role,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : `Request failed (${res.status})`)
        return
      }
      toast.success(data.message || 'Invitation sent. They will receive an email to set their password.')
      setEmail('')
      setName('')
      setOrganization('')
      router.refresh()
    } catch {
      toast.error('Network error — could not send invite.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none border transition-all focus:border-[var(--accent)]'
  const inpS = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div>
        <h2 className="font-semibold text-sm">Invite team member</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Sends a single-use link (48h) so they can set a password. Clients use the public sign-up page instead.
        </p>
      </div>
      <form onSubmit={sendInvite} className="space-y-3">
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Work email *
          </label>
          <input type="email" required className={`${inp} mt-1`} style={inpS} value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Name
          </label>
          <input type="text" className={`${inp} mt-1`} style={inpS} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Organization
          </label>
          <input type="text" className={`${inp} mt-1`} style={inpS} value={organization} onChange={e => setOrganization(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Role *
          </label>
          <select className={`${inp} mt-1`} style={inpS} value={role} onChange={e => setRole(e.target.value as typeof role)}>
            <option value="RESEARCHER">Researcher</option>
            <option value="FINANCE">Finance</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {loading ? (
            <>
              <Spinner size="sm" label="Sending invitation" />
              <span>Sending…</span>
            </>
          ) : (
            'Send invitation email'
          )}
        </button>
      </form>
    </div>
  )
}
