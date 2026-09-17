'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/#focus', label: 'Focus Areas' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#contact', label: 'Contact' },
]

export function BrandLogo() {
  return (
    <>
      <img src="/researchforge-logo.png" alt="ResearchForge mark" />
      <span className="logo-word">Research<span>Forge</span></span>
    </>
  )
}

export function SiteHeader({ active }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/#top" className="logo" onClick={() => setMenuOpen(false)}>
          <BrandLogo />
        </Link>
        <nav className={`links${menuOpen ? ' open' : ''}`}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={active && l.href.includes(active) ? 'is-current' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/#contact" className="btn btn-solid nav-cta" onClick={() => setMenuOpen(false)}>
          Partner with us
        </Link>
        <button type="button" className="menu-toggle" aria-label="Menu" onClick={() => setMenuOpen(v => !v)}>
          &#9776;
        </button>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-logo"><BrandLogo /></div>
            <p>Turning African evidence into decisions that work — field-based data, research and intelligence for governments, investors, development organizations and businesses.</p>
          </div>
          <div className="foot-col">
            <h5>Site</h5>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/#focus">Focus Areas</Link></li>
              <li><Link href="/#projects">Projects</Link></li>
              <li><Link href="/#contact">Contact</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Focus Areas</h5>
            <ul>
              <li><Link href="/#focus">Agriculture &amp; Food Systems</Link></li>
              <li><Link href="/#focus">Energy &amp; Productive Use</Link></li>
              <li><Link href="/#focus">Climate Resilience</Link></li>
              <li><Link href="/#focus">Data &amp; Resource Intelligence</Link></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="mailto:researchforgeconsulting@gmail.com">researchforgeconsulting@gmail.com</a></li>
              <li><Link href="/#contact">Partner with us</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 ResearchForge. All rights reserved.</span>
          <span>Turning African evidence into decisions that work.</span>
        </div>
      </div>
    </footer>
  )
}

export function TeamLinks() {
  return (
    <div className="t-links">
      <a href="mailto:researchforgeconsulting@gmail.com" aria-label="Email">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="M4 6l8 7 8-7" /></svg>
      </a>
      <a href="#" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 11v5M8 8v.01M12 16v-5M12 11c0-1.5 1-2 2-2s2 .8 2 2v5" /></svg>
      </a>
    </div>
  )
}
