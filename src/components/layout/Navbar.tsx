'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from './ThemeToggle'
import { getDashboardPath } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const user = session?.user
  const authed = Boolean(user)

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#clients', label: 'Clients' },
    { href: '#approach', label: 'Approach' },
    { href: '#insights', label: 'Insights' },
  ]

  return (
    <>
      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999] flex flex-col items-stretch justify-start gap-8 px-[6%] pt-24 pb-10 md:pt-28 overflow-y-auto"
          style={{ background: 'var(--nav-drawer-bg)' }}
        >
          <nav className="flex w-full max-w-md flex-col items-start gap-3 md:gap-4" aria-label="Sections">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block w-full text-left text-2xl font-semibold transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text)' }}>{l.label}</a>
            ))}
          </nav>
          {authed ? (
            <Link href={getDashboardPath((user as { role?: string }).role ?? 'CLIENT')}
              className="block w-full max-w-md text-left text-2xl font-semibold" style={{ color: 'var(--accent)' }}
              onClick={() => setMenuOpen(false)}>Dashboard</Link>
          ) : (
            <div className="flex w-full max-w-md flex-col items-start gap-4">
              <Link
                href="/login"
                className="block w-full text-left text-2xl font-semibold border-b-2 border-transparent hover:border-[var(--accent)] pb-0.5 transition-colors"
                style={{ color: 'var(--text)' }}
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex self-start px-6 py-2 rounded-full font-bold text-lg"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                onClick={() => setMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}

      <nav className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-[6%] transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}
        style={{
          background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--nav-border)',
        }}>
        <a href="#hero" className="font-serif text-2xl font-bold flex-shrink-0" style={{ color: 'var(--text)' }}>
          Research<span style={{ color: 'var(--accent)' }}>Forge</span>
        </a>

        <ul className="hidden md:flex gap-7 list-none items-center">
          {navLinks.map(l => (
            <li key={l.href}>
              <a href={l.href} className="text-sm font-medium transition-colors relative group"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                {l.label}
                <span className="absolute bottom-[-4px] left-0 right-0 h-[1.5px] bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {authed ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href={getDashboardPath((user as { role?: string }).role ?? 'CLIENT')}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-2 rounded-full text-xs font-medium border transition-all"
                style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold border transition-all hover:border-[var(--accent)]"
                style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
              >
                Sign up
              </Link>
            </div>
          )}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden flex flex-col gap-[5px] p-1 bg-transparent border-none cursor-pointer">
            <span className={`block w-[22px] h-[2px] rounded transition-all ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} style={{ background: 'var(--text)' }} />
            <span className={`block w-[22px] h-[2px] rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} style={{ background: 'var(--text)' }} />
            <span className={`block w-[22px] h-[2px] rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} style={{ background: 'var(--text)' }} />
          </button>
        </div>
      </nav>
    </>
  )
}
