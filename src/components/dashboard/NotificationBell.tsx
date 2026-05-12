'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Notif { id: string; title: string; message: string; type: string; read: boolean; link?: string; createdAt: string }

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifs(d) })
  }, [])

  const unread = notifs.filter(n => !n.read).length

  async function markRead() {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifs(n => n.map(x => ({ ...x, read: true })))
  }

  const typeColor: Record<string,string> = { success:'var(--accent)', warning:'#f0a500', error:'#e24b4a', info:'#378add' }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(v => !v); if (unread > 0) markRead() }}
        className="relative w-8 h-8 flex items-center justify-center rounded-full border transition-all hover:border-[var(--accent)]"
        style={{ borderColor: 'var(--card-border)', background: 'transparent' }}>
        <span className="text-base">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: '#e24b4a', color: '#fff' }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden"
          style={{ background: 'var(--navy-mid)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <span className="text-sm font-semibold">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-xs" style={{ color: 'var(--muted)' }}>✕</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 && <p className="text-xs text-center py-8" style={{ color: 'var(--muted)' }}>No notifications</p>}
            {notifs.map(n => (
              <div key={n.id} onClick={() => setOpen(false)}
                className="px-4 py-3 border-b last:border-0 hover:bg-[rgba(255,255,255,.03)] cursor-pointer"
                style={{ borderColor: 'var(--card-border)', background: n.read ? 'transparent' : 'rgba(0,198,162,.04)' }}>
                {n.link ? (
                  <Link href={n.link} className="block">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? 'transparent' : typeColor[n.type] }}/>
                      <div>
                        <p className="text-xs font-semibold">{n.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{n.message}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? 'transparent' : typeColor[n.type] }}/>
                    <div>
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{n.message}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
