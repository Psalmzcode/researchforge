'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminStaffInvite() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState<'RESEARCHER' | 'FINANCE' | 'ADMIN'>('RESEARCHER')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
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
      setLoading(false)
      if (!res.ok) {
        setMsg({ type: 'err', text: data.error || 'Could not send invite' })
        return
      }
      setMsg({ type: 'ok', text: data.message || 'Invitation sent. They will receive an email with a link to set their password.' })
      setEmail('')
      setName('')
      setOrganization('')
      router.refresh()
    } catch {
      setLoading(false)
      setMsg({ type: 'err', text: 'Network error' })
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
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Work email *</label>
          <input type="email" required className={`${inp} mt-1`} style={inpS} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Name</label>
          <input type="text" className={`${inp} mt-1`} style={inpS} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Organization</label>
          <input type="text" className={`${inp} mt-1`} style={inpS} value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Role *</label>
          <select className={`${inp} mt-1`} style={inpS} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
            <option value="RESEARCHER">Researcher</option>
            <option value="FINANCE">Finance</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {msg && (
          <p className={`text-xs p-2 rounded-lg ${msg.type === 'ok' ? '' : ''}`} style={{ background: msg.type === 'ok' ? 'rgba(0,198,162,.1)' : 'rgba(226,75,74,.1)', color: msg.type === 'ok' ? 'var(--accent)' : '#e24b4a' }}>
            {msg.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full text-xs font-bold disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {loading ? 'Sending…' : 'Send invitation email'}
        </button>
      </form>
    </div>
  )
}
