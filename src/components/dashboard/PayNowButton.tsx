'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'

export function PayNowButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false)
  async function pay() {
    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.authorizationUrl) {
        toast.success('Redirecting to Paystack…')
        window.location.href = data.authorizationUrl
        return
      }
      const msg =
        typeof data.error === 'string'
          ? data.error
          : !res.ok
            ? `Request failed (${res.status})`
            : 'Payment initialization failed'
      toast.error(msg)
    } catch {
      toast.error('Could not start payment. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      onClick={pay}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 text-[.7rem] font-bold px-2.5 py-1 rounded-full transition-all hover:opacity-90 disabled:opacity-60"
      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
    >
      {loading ? (
        <>
          <Spinner size="sm" label="Starting payment" />
          <span>Pay</span>
        </>
      ) : (
        'Pay Now'
      )}
    </button>
  )
}
