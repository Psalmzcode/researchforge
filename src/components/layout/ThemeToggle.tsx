'use client'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [light, setLight] = useState(false)

  useEffect(() => {
    setLight(document.documentElement.classList.contains('light'))
  }, [])

  function toggle() {
    const isLight = document.documentElement.classList.toggle('light')
    setLight(isLight)
    localStorage.setItem('sw-theme', isLight ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200"
      style={{ borderColor: 'var(--card-border)', color: 'var(--muted)', background: 'transparent' }}
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className="text-sm">{light ? '🌙' : '☀️'}</span>
      <span className="hidden sm:inline">{light ? 'Dark' : 'Light'}</span>
    </button>
  )
}
