'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Could not create account')
        return
      }
      router.push('/login?registered=1')
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
          <h1 className="text-xl font-bold mb-1">Create an account</h1>
          <p className="text-[.88rem] mb-8" style={{ color: 'var(--muted)' }}>
            Sign up as a client to submit orders and track projects.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Name <span className="font-normal opacity-70">(optional)</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]"
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@organization.com"
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]"
                style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="At least 8 characters"
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
              {loading ? 'Creating account…' : 'Sign up →'}
            </button>
          </form>
          <p className="text-center mt-6 text-[.83rem]" style={{ color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
        <p className="text-center mt-6 text-[.83rem]" style={{ color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--accent)' }}>
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
