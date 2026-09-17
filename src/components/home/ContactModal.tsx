'use client'

import { createContext, useCallback, useContext, useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'

type ContactModalContextValue = {
  openContact: () => void
}

const ContactModalContext = createContext<ContactModalContextValue | null>(null)

export function useContactModal() {
  const ctx = useContext(ContactModalContext)
  if (!ctx) throw new Error('useContactModal must be used within ContactModalProvider')
  return ctx
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openContact = useCallback(() => setOpen(true), [])

  return (
    <ContactModalContext.Provider value={{ openContact }}>
      {children}
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </ContactModalContext.Provider>
  )
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [purpose, setPurpose] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'loading') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose, status])

  useEffect(() => {
    if (!open) {
      setStatus('idle')
      setError('')
    }
  }, [open])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, organisation, purpose }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setError(data.error || 'Could not send your message. Please try again.')
        return
      }
      setStatus('success')
      setName('')
      setEmail('')
      setOrganisation('')
      setPurpose('')
    } catch {
      setStatus('error')
      setError('Could not send your message. Please try again.')
    }
  }

  if (!open) return null

  return (
    <div className="rf-modal-root" role="presentation">
      <button type="button" className="rf-modal-backdrop" aria-label="Close dialog" onClick={() => status !== 'loading' && onClose()} />
      <div className="rf-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="rf-modal-head">
          <div>
            <div className="eyebrow">Contact</div>
            <h2 id={titleId}>Start a conversation</h2>
          </div>
          <button type="button" className="rf-modal-close" aria-label="Close" disabled={status === 'loading'} onClick={onClose}>
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div className="rf-modal-success">
            <p>Thank you — your message is on its way to the ResearchForge team. We’ll get back to you soon.</p>
            <button type="button" className="btn btn-solid" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="rf-modal-form" onSubmit={onSubmit}>
            <label>
              <span>Full name</span>
              <input
                required
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@organisation.com"
                autoComplete="email"
              />
            </label>
            <label>
              <span>Organisation <em>(optional)</em></span>
              <input
                name="organisation"
                value={organisation}
                onChange={e => setOrganisation(e.target.value)}
                placeholder="Company or institution"
                autoComplete="organization"
              />
            </label>
            <label>
              <span>Purpose</span>
              <textarea
                required
                name="purpose"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Tell us what you need help with — research, partnership, study commission, or something else."
                rows={5}
              />
            </label>

            {status === 'error' && <p className="rf-modal-error">{error}</p>}

            <div className="rf-modal-actions">
              <button type="button" className="btn btn-outline" disabled={status === 'loading'} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-solid" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export function ContactTrigger({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const { openContact } = useContactModal()
  return (
    <button type="button" className={className} style={style} onClick={openContact}>
      {children}
    </button>
  )
}
