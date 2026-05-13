'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

function SignupVerifyInner() {
  const router = useRouter()
  const sp = useSearchParams()
  const emailParam = (sp.get('email') || '').trim().toLowerCase()

  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (!emailParam) router.replace('/signup')
  }, [emailParam, router])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailParam,
          code: code.replace(/\D/g, '').slice(0, 6),
        }),
      })
      const data = await res.json().catch(() => ({}))
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }
      router.push('/login?registered=1')
    } catch {
      setLoading(false)
      setError('Something went wrong. Try again.')
    }
  }

  async function handleResend() {
    setError('')
    setInfo('')
    if (password.length < 8) {
      setError('Enter the same password you used on the sign-up form (required to resend the code).')
      return
    }
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/resend-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, password }),
      })
      const data = await res.json().catch(() => ({}))
      setResendLoading(false)
      if (!res.ok) {
        setError(data.error || 'Could not resend code')
        return
      }
      setInfo(data.message || 'A new code was sent.')
    } catch {
      setResendLoading(false)
      setError('Something went wrong. Try again.')
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]'
  const inputStyle = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  if (!emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
        Redirecting…
      </div>
    )
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
          <h1 className="text-xl font-bold mb-1">Verify your email</h1>
          <p className="text-[.88rem] mb-6" style={{ color: 'var(--muted)' }}>
            Enter the 6-digit code sent to <strong style={{ color: 'var(--text)' }}>{emailParam}</strong>. Your account is created only after
            verification.
          </p>
          {info && (
            <p className="text-[.83rem] mb-4 p-3 rounded-xl" style={{ background: 'rgba(0,198,162,.12)', color: 'var(--accent)' }}>
              {info}
            </p>
          )}
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className={`${inputClass} tracking-[0.35em] text-center text-lg font-mono`}
                style={inputStyle}
              />
            </div>
            {error && <p className="text-[.83rem] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3.5 rounded-full font-bold text-[.93rem] mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-70"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              {loading ? 'Verifying…' : 'Verify and create account →'}
            </button>
          </form>
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{ color: 'var(--muted)' }}>
                Password <span className="font-normal opacity-70">(for resend only)</span>
              </label>
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Same password as sign-up"
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              disabled={resendLoading}
              onClick={handleResend}
              className="text-[.83rem] font-semibold text-left disabled:opacity-50"
              style={{ color: 'var(--accent)' }}
            >
              {resendLoading ? 'Sending…' : 'Resend code'}
            </button>
            <Link href="/signup" className="text-[.83rem]" style={{ color: 'var(--muted)' }}>
              ← Back to sign-up
            </Link>
          </div>
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

export default function SignupVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)', color: 'var(--muted)' }}>
          Loading…
        </div>
      }
    >
      <SignupVerifyInner />
    </Suspense>
  )
}
