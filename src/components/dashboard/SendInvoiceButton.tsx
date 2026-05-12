'use client'
import { useState } from 'react'
export function SendInvoiceButton({ invoiceId, clientEmail }: { invoiceId: string; clientEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  async function send() {
    setLoading(true)
    await fetch('/api/invoices/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId }),
    })
    setLoading(false); setSent(true)
  }
  if (sent) return <span className="text-xs" style={{ color: 'var(--accent)' }}>✉ Sent</span>
  return (
    <button onClick={send} disabled={loading}
      className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: 'rgba(55,138,221,.2)', color: '#378add' }}>
      {loading ? '…' : '✉ Remind'}
    </button>
  )
}
