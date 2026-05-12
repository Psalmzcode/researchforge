'use client'
import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { getDashboardPath } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registeredOk, setRegisteredOk] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (new URLSearchParams(window.location.search).get('registered') === '1') setRegisteredOk(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (res?.error || !res?.ok) {
        setError('Invalid email or password')
        return
      }
      // Sync client session cache (next-auth internal)
      const session = await getSession()
      const role = (session?.user as { role?: string } | undefined)?.role ?? 'CLIENT'
      const path = getDashboardPath(role)
      // Full navigation so server components (auth()) see the session cookie — router.push alone is flaky here
      window.location.assign(path)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{background:'var(--navy)'}}>
      <div className="absolute top-4 right-6"><ThemeToggle /></div>
      <div className="w-full max-w-[420px]">
        <a href="/" className="font-serif text-2xl font-bold block text-center mb-10" style={{ color: 'var(--text)' }}>
          Research<span style={{color:'var(--accent)'}}>Forge</span>
        </a>
        <div className="rounded-3xl p-10 border" style={{background:'rgba(255,255,255,.04)',borderColor:'var(--card-border)'}}>
          <h1 className="text-xl font-bold mb-1">Welcome back</h1>
          <p className="text-[.88rem] mb-8" style={{color:'var(--muted)'}}>Sign in to your dashboard</p>
          {registeredOk && (
            <p className="text-[.83rem] mb-4 p-3 rounded-xl" style={{background:'rgba(0,198,162,.12)',color:'var(--accent)'}}>
              Account created. You can sign in below.
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Email</label>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
                placeholder="you@organization.com"
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]"
                style={{background:'rgba(255,255,255,.05)',borderColor:'var(--card-border)',color:'var(--text)'}}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Password</label>
              <input type="password" required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-[.9rem] outline-none border transition-all focus:border-[var(--accent)]"
                style={{background:'rgba(255,255,255,.05)',borderColor:'var(--card-border)',color:'var(--text)'}}/>
            </div>
            {error && <p className="text-[.83rem] text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-full font-bold text-[.93rem] mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-70"
              style={{background:'var(--accent)',color:'var(--text-on-accent)'}}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
          <div className="mt-6 p-4 rounded-xl text-[.78rem] leading-6" style={{background:'rgba(0,198,162,.05)',color:'var(--muted)'}}>
            <strong style={{ color: 'var(--text)' }}>Test accounts:</strong><br/>
            admin@researchforge.com / admin123<br/>
            aisha@unicef.org / client123<br/>
            tunde@researchforge.com / research123<br/>
            ngozi@researchforge.com / finance123
          </div>
        </div>
        <p className="text-center mt-6 text-[.83rem]" style={{color:'var(--muted)'}}>
          New here?{' '}
          <a href="/signup" style={{color:'var(--accent)'}}>Create an account</a>
        </p>
        <p className="text-center mt-2 text-[.83rem]" style={{color:'var(--muted)'}}>
          <a href="/" style={{color:'var(--accent)'}}>← Back to website</a>
        </p>
      </div>
    </div>
  )
}
