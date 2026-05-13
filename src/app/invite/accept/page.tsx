'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

function InviteAcceptInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const token = sp.get('t') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!token || token.length < 64) {
      setError('Invalid or missing invitation link. Open the link from your email.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Could not activate account')
        return
      }
      router.push('/login?invited=1')
    } catch {
      setLoading(false)
      setError('Something went wrong. Try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--navy)' }}>
      <div className="absolute top-4 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px]">
        <Link href="/" className="font-serif text-2xl font-bold block text-center mb-10" style={{ color: 'var(--text)' }}>
          Research<span style={{ color: 'var(--accent)' }}>Forge</span>
        </Link>
        <div className="rounded-3xl p-10 border" style={{ background: 'rgba(255,255,255,.04)', borderColor: 'var(--card-border)' }}>
          <h1 className="text-xl font-bold mb-1">Accept invitation</h1>
          <p className="text-[.88rem] mb-8" style={{ color: 'var(--muted)' }}>
            Choose a password for your team account. This verifies your email.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]"
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Confirm password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]"
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>
            {error && <p className="text-[.83rem] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full font-bold text-[.93rem] mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-70"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              {loading ? 'Saving…' : 'Activate account →'}
            </button>
          </form>
        </div>
        <p className="text-center mt-6 text-[.83rem]" style={{ color: 'var(--muted)' }}>
          <Link href="/login" style={{ color: 'var(--accent)' }}>
            Already have an account? Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--muted)' }}>Loading…</div>}>
      <InviteAcceptInner />
    </Suspense>
  )
}
