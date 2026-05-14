'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'

function PaymentResultInner() {
  const sp = useSearchParams()
  const router = useRouter()
  /** Paystack redirects with `reference=` (docs); we also accept `ref` / `trxref`. */
  const ref = sp.get('reference') || sp.get('ref') || sp.get('trxref')
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading')
  const [detail, setDetail] = useState<string>('')

  useEffect(() => {
    if (!ref) {
      setState('err')
      const msg = 'Missing payment reference (expected ?reference= from Paystack).'
      setDetail(msg)
      toast.error(msg)
      return
    }
    fetch(`/api/payments/verify?reference=${encodeURIComponent(ref)}`)
      .then(async res => {
        const data = await res.json()
        if (res.ok && data.ok) {
          const d = `${data.invoiceNumber} · ${data.projectTitle}`
          setState('ok')
          setDetail(d)
          toast.success('Payment confirmed', { description: d })
          router.refresh()
        } else {
          const msg = data.error || 'Could not verify payment.'
          setState('err')
          setDetail(msg)
          toast.error(msg)
        }
      })
      .catch(() => {
        const msg = 'Network error.'
        setState('err')
        setDetail(msg)
        toast.error(msg)
      })
  }, [ref, router])

  return (
    <div className="max-w-lg mx-auto space-y-6 py-16 px-6">
      <h1 className="font-serif text-2xl font-bold">Payment</h1>
      {state === 'loading' && (
        <div className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <Spinner size="md" label="Confirming payment" />
          <span>Confirming with Paystack…</span>
        </div>
      )}
      {state === 'ok' && (
        <div className="rounded-2xl border p-6 space-y-3" style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}>
          <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>
            Payment received
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {detail}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            If you had orders waiting on a final installment, final deliverables unlock automatically once all installment invoices for that project are paid.
          </p>
          <Link href="/dashboard/client/invoices" className="inline-block text-sm font-bold mt-2" style={{ color: 'var(--accent)' }}>
            View invoices →
          </Link>
        </div>
      )}
      {state === 'err' && (
        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--card-border)', background: 'rgba(226,75,74,.06)' }}>
          <p className="text-sm font-semibold" style={{ color: '#e24b4a' }}>
            Could not confirm payment
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            {detail}
          </p>
          <Link href="/dashboard/client/invoices" className="inline-block text-sm font-bold mt-4" style={{ color: 'var(--accent)' }}>
            Back to invoices →
          </Link>
        </div>
      )}
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-16 text-sm" style={{ color: 'var(--muted)' }}>
          <Spinner size="md" label="Loading payment result" />
          <span>Loading…</span>
        </div>
      }
    >
      <PaymentResultInner />
    </Suspense>
  )
}
