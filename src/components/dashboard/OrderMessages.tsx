'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'

interface Msg {
  id: string
  message: string
  isInternal: boolean
  createdAt: string
  user: { name: string | null; role: string }
}

export function OrderMessages({ orderId, initialMessages, userRole }: { orderId: string; initialMessages: Msg[]; userRole: string }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages)
  const [text, setText] = useState('')
  const [internal, setInternal] = useState(false)
  const [sending, setSending] = useState(false)

  async function send() {
    if (!text.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, isInternal: internal }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages(m => [...m, msg])
        setText('')
        toast.success('Message sent.')
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not send message.')
    } finally {
      setSending(false)
    }
  }

  const roleColor: Record<string, string> = {
    ADMIN: 'rgba(55,138,221,.2)',
    CLIENT: 'rgba(0,198,162,.2)',
    RESEARCHER: 'rgba(240,165,0,.2)',
    FINANCE: 'rgba(226,75,74,.2)',
  }

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <h2 className="font-semibold text-sm mb-4">Messages</h2>
      <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>
            No messages yet — ask a question or send an update
          </p>
        )}
        {messages.map(m => (
          <div
            key={m.id}
            className={`p-3 rounded-xl text-sm ${m.isInternal ? 'border border-dashed' : ''}`}
            style={{
              background: m.isInternal ? 'rgba(240,165,0,.05)' : 'rgba(255,255,255,.03)',
              borderColor: 'rgba(240,165,0,.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: roleColor[m.user.role] || 'rgba(0,198,162,.2)', color: 'var(--text)' }}
              >
                {(m.user.name || '?')[0]}
              </span>
              <span className="text-xs font-semibold">{m.user.name}</span>
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                {m.user.role}
              </span>
              {m.isInternal && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,165,0,.2)', color: '#f0a500' }}>
                  internal
                </span>
              )}
              <span className="text-[10px] ml-auto" style={{ color: 'var(--muted)' }}>
                {formatDate(m.createdAt)}
              </span>
            </div>
            <p className="leading-relaxed">{m.message}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {(userRole === 'ADMIN' || userRole === 'RESEARCHER') && (
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--muted)' }}>
            <input type="checkbox" checked={internal} onChange={e => setInternal(e.target.checked)} className="accent-[var(--accent)]" />
            Internal note (not visible to client)
          </label>
        )}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none border transition-all focus:border-[var(--accent)]"
            style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="inline-flex min-w-[4.5rem] items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            {sending ? <Spinner size="sm" label="Sending" /> : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
