'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Spinner } from '@/components/ui/Spinner'

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
      const msg = 'Password must be at least 8 characters.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (password !== confirm) {
      const msg = 'Passwords do not match.'
      setError(msg)
      toast.error(msg)
      return
    }
    if (!token || token.length < 64) {
      const msg = 'Invalid or missing invitation link. Open the link from your email.'
      setError(msg)
      toast.error(msg)
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
        const msg = data.error || 'Could not activate account'
        setError(msg)
        toast.error(msg)
        return
      }
      toast.success('Account activated. Sign in with your new password.')
      router.push('/login?invited=1')
    } catch {
      setLoading(false)
      const msg = 'Something went wrong. Try again.'
      setError(msg)
      toast.error(msg)
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
              className="inline-flex w-full items-center justify-center gap-2 py-3.5 rounded-full font-bold text-[.93rem] mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-70"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" label="Saving account" />
                  <span>Saving…</span>
                </>
              ) : (
                'Activate account →'
              )}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ color: 'var(--muted)' }}>
          <Spinner size="md" label="Loading invitation" />
          <span className="text-sm">Loading…</span>
        </div>
      }
    >
      <InviteAcceptInner />
    </Suspense>
  )
}
