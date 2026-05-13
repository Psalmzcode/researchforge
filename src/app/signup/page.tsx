'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { Spinner } from '@/components/ui/Spinner'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
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
        const msg = data.error || 'Could not start registration'
        setError(msg)
        toast.error(msg)
        return
      }
      toast.success('Check your email for the 6-digit code.')
      const email = form.email.trim().toLowerCase()
      router.push(`/signup/verify?email=${encodeURIComponent(email)}`)
    } catch {
      setLoading(false)
      const msg = 'Something went wrong. Try again.'
      setError(msg)
      toast.error(msg)
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]'
  const inputStyle = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

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
            Sign up as a client. Next, you&apos;ll open the verification page and enter the code we email you.
          </p>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Name <span className="font-normal opacity-70">(optional)</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className={inputClass}
                style={inputStyle}
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
                className={inputClass}
                style={inputStyle}
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
                className={inputClass}
                style={inputStyle}
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
                  <Spinner size="sm" label="Sending verification code" />
                  <span>Sending code…</span>
                </>
              ) : (
                'Continue to verification →'
              )}
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
