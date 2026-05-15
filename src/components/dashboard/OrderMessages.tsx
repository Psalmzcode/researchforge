'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'
import { formatDate } from '@/lib/utils'

const POLL_MS = 4000
const EDIT_MS = 15 * 60 * 1000

export interface OrderMessageDto {
  id: string
  userId: string
  message: string
  isInternal: boolean
  audience?: string
  createdAt: string
  editedAt: string | null
  user: { name: string | null; role: string }
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="opacity-80">
      <path fill="currentColor" d="M3 4.5h12v1.5H3V4.5zm0 4h12v1.5H3V8.5zm0 4h12v1.5H3v-1.5z" />
    </svg>
  )
}

export function OrderMessages({
  orderId,
  initialMessages,
  userRole,
  currentUserId,
}: {
  orderId: string
  initialMessages: OrderMessageDto[]
  userRole: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState<OrderMessageDto[]>(initialMessages)
  const [text, setText] = useState('')
  const [internal, setInternal] = useState(false)
  const [adminAudience, setAdminAudience] = useState<'CLIENT' | 'RESEARCHER'>('CLIENT')
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const stickBottomRef = useRef(true)

  const scrollIfStuck = useCallback(() => {
    const el = listRef.current
    if (!el || !stickBottomRef.current) return
    el.scrollTop = el.scrollHeight
  }, [])

  const onListScroll = () => {
    const el = listRef.current
    if (!el) return
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight
    stickBottomRef.current = gap < 72
  }

  const fetchMessages = useCallback(async () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`)
      if (!res.ok) return
      const list: OrderMessageDto[] = await res.json()
      setMessages(list)
      requestAnimationFrame(scrollIfStuck)
    } catch {
      /* ignore transient poll errors */
    }
  }, [orderId, scrollIfStuck])

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    const id = window.setInterval(fetchMessages, POLL_MS)
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchMessages()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [fetchMessages])

  useEffect(() => {
    scrollIfStuck()
  }, [messages.length, scrollIfStuck])

  useEffect(() => {
    if (!menuOpenForId) return
    const close = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest(`[data-msg-menu-root="${menuOpenForId}"]`)) setMenuOpenForId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpenForId])

  function canEdit(m: OrderMessageDto) {
    if (m.userId !== currentUserId) return false
    return Date.now() - new Date(m.createdAt).getTime() <= EDIT_MS
  }

  function canDelete(m: OrderMessageDto) {
    if (userRole === 'ADMIN') return true
    return m.userId === currentUserId
  }

  function startEdit(m: OrderMessageDto) {
    setEditingId(m.id)
    setEditText(m.message)
    setMenuOpenForId(null)
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editText }),
      })
      if (res.ok) {
        const updated: OrderMessageDto = await res.json()
        setMessages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        setEditingId(null)
        setEditText('')
        toast.success('Message updated.')
        stickBottomRef.current = true
        requestAnimationFrame(scrollIfStuck)
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not update message.')
    } finally {
      setEditSaving(false)
    }
  }

  async function removeMessage(messageId: string) {
    if (!window.confirm('Remove this message? Others will no longer see it.')) return
    setMenuOpenForId(null)
    setDeletingId(messageId)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages/${messageId}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages((prev) => prev.filter((x) => x.id !== messageId))
        toast.success('Message removed.')
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not delete message.')
    } finally {
      setDeletingId(null)
    }
  }

  async function send() {
    if (!text.trim()) return
    setSending(true)
    try {
      const body: Record<string, unknown> = { message: text, isInternal: internal }
      if (userRole === 'ADMIN' && !internal) body.adminAudience = adminAudience
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const msg: OrderMessageDto = await res.json()
        setMessages((m) => [...m, msg])
        setText('')
        setInternal(false)
        setAdminAudience('CLIENT')
        stickBottomRef.current = true
        requestAnimationFrame(scrollIfStuck)
        toast.success('Message sent.')
        void fetchMessages()
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

  const threadHint =
    userRole === 'CLIENT'
      ? 'Only you and the coordinator can see this thread. Field staff use a separate channel.'
      : userRole === 'RESEARCHER'
        ? 'You are messaging the coordinator only. The client cannot see this thread.'
        : userRole === 'ADMIN'
          ? 'Choose Client or Researcher below so each side only sees their own conversation with you.'
          : null

  return (
    <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-semibold text-sm">Messages</h2>
          {threadHint && (
            <p className="text-[10px] mt-1 leading-snug max-w-[320px]" style={{ color: 'var(--muted)' }}>
              {threadHint}
            </p>
          )}
        </div>
        <p className="text-[10px] leading-snug text-right max-w-[200px]" style={{ color: 'var(--muted)' }}>
          Updates every few seconds while this tab is open. Edit your own messages within 15 minutes.
        </p>
      </div>
      <div
        ref={listRef}
        onScroll={onListScroll}
        className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1 scroll-smooth"
      >
        {messages.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>
            No messages yet — ask a question or send an update
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-xl text-sm ${m.isInternal ? 'border border-dashed' : ''}`}
            style={{
              background: m.isInternal ? 'rgba(240,165,0,.05)' : 'rgba(255,255,255,.03)',
              borderColor: 'rgba(240,165,0,.3)',
            }}
          >
            <div className="flex items-start gap-2 mb-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap flex-1 min-w-0">
                <span
                  className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0"
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
                {userRole === 'ADMIN' && m.audience === 'RESEARCHER_ADMIN' && !m.isInternal && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,165,0,.12)', color: '#f0a500' }}>
                    researcher thread
                  </span>
                )}
                {userRole === 'ADMIN' && m.audience === 'CLIENT_ADMIN' && !m.isInternal && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,198,162,.12)', color: 'var(--accent)' }}>
                    client thread
                  </span>
                )}
                {m.editedAt && (
                  <span className="text-[10px] italic" style={{ color: 'var(--muted)' }}>
                    (edited)
                  </span>
                )}
                <span className="text-[10px] ml-auto sm:ml-0" style={{ color: 'var(--muted)' }}>
                  {formatDate(m.createdAt)}
                </span>
              </div>
              {(canEdit(m) || canDelete(m)) && editingId !== m.id && (
                <div className="relative shrink-0" data-msg-menu-root={m.id}>
                  <button
                    type="button"
                    aria-expanded={menuOpenForId === m.id}
                    aria-label="Message actions"
                    onClick={() => setMenuOpenForId((cur) => (cur === m.id ? null : m.id))}
                    className="p-1.5 rounded-lg border transition-colors hover:opacity-90"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                  >
                    <MenuIcon />
                  </button>
                  {menuOpenForId === m.id && (
                    <div
                      className="absolute right-0 top-full mt-1 z-20 min-w-[7.5rem] rounded-lg border py-1 text-left shadow-lg"
                      style={{ background: 'var(--surface-elevated)', borderColor: 'var(--card-border)' }}
                    >
                      {canEdit(m) && (
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          className="block w-full px-3 py-2 text-left text-xs font-medium hover:bg-[rgba(255,255,255,.08)]"
                          style={{ color: 'var(--text)' }}
                        >
                          Edit
                        </button>
                      )}
                      {canDelete(m) && (
                        <button
                          type="button"
                          onClick={() => void removeMessage(m.id)}
                          disabled={deletingId === m.id}
                          className="block w-full px-3 py-2 text-left text-xs font-medium hover:bg-[rgba(226,75,74,.08)] disabled:opacity-50"
                          style={{ color: '#e24b4a' }}
                        >
                          {deletingId === m.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {editingId === m.id ? (
              <div className="space-y-2 mt-2">
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none border resize-y"
                  style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={editSaving || !editText.trim()}
                    className="px-3 py-1.5 rounded-full text-xs font-bold disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                  >
                    {editSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setEditText('')
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {userRole === 'ADMIN' && !internal && (
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--muted)' }}>
            <span className="font-medium shrink-0">Send to:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="adminAudience"
                checked={adminAudience === 'CLIENT'}
                onChange={() => setAdminAudience('CLIENT')}
                className="accent-[var(--accent)]"
              />
              Client thread
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="adminAudience"
                checked={adminAudience === 'RESEARCHER'}
                onChange={() => setAdminAudience('RESEARCHER')}
                className="accent-[var(--accent)]"
              />
              Researcher thread
            </label>
          </div>
        )}
        {userRole === 'ADMIN' && (
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--muted)' }}>
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="accent-[var(--accent)]" />
            Internal note (admin only — not visible to client or researcher)
          </label>
        )}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            placeholder="Type a message…"
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none border transition-all focus:border-[var(--accent)]"
            style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
          />
          <button
            type="button"
            onClick={() => void send()}
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
