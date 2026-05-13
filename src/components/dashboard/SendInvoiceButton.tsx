'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'

export function SendInvoiceButton({ invoiceId, clientEmail }: { invoiceId: string; clientEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function send() {
    setLoading(true)
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      if (res.ok) {
        setSent(true)
        toast.success(`Reminder queued for ${clientEmail}`)
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not send reminder.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return <span className="text-xs" style={{ color: 'var(--accent)' }}>✉ Sent</span>

  return (
    <button
      type="button"
      onClick={send}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: 'rgba(55,138,221,.2)', color: '#378add' }}
    >
      {loading ? (
        <>
          <Spinner size="sm" label="Sending reminder" />
          <span>Send</span>
        </>
      ) : (
        '✉ Remind'
      )}
    </button>
  )
}
