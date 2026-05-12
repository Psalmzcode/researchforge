'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentResultInner() {
  const sp = useSearchParams()
  const ref = sp.get('ref')
  const [state, setState] = useState<'loading' | 'ok' | 'err'>('loading')
  const [detail, setDetail] = useState<string>('')

  useEffect(() => {
    if (!ref) {
      setState('err')
      setDetail('Missing payment reference.')
      return
    }
    fetch(`/api/payments/verify?ref=${encodeURIComponent(ref)}`)
      .then(async res => {
        const data = await res.json()
        if (res.ok && data.ok) {
          setState('ok')
          setDetail(`${data.invoiceNumber} · ${data.projectTitle}`)
        } else {
          setState('err')
          setDetail(data.error || 'Could not verify payment.')
        }
      })
      .catch(() => {
        setState('err')
        setDetail('Network error.')
      })
  }, [ref])

  return (
    <div className="max-w-lg mx-auto space-y-6 py-16 px-6">
      <h1 className="font-serif text-2xl font-bold">Payment</h1>
      {state === 'loading' && <p className="text-sm" style={{ color: 'var(--muted)' }}>Confirming with Paystack…</p>}
      {state === 'ok' && (
        <div className="rounded-2xl border p-6 space-y-3" style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}>
          <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>Payment received</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{detail}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            If you had orders waiting on a final installment, final deliverables unlock automatically once all installment invoices for that project are paid.
          </p>
          <Link href="/dashboard/client/invoices" className="inline-block text-sm font-bold mt-2" style={{ color: 'var(--accent)' }}>View invoices →</Link>
        </div>
      )}
      {state === 'err' && (
        <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--card-border)', background: 'rgba(226,75,74,.06)' }}>
          <p className="text-sm font-semibold" style={{ color: '#e24b4a' }}>Could not confirm payment</p>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>{detail}</p>
          <Link href="/dashboard/client/invoices" className="inline-block text-sm font-bold mt-4" style={{ color: 'var(--accent)' }}>Back to invoices →</Link>
        </div>
      )}
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>}>
      <PaymentResultInner />
    </Suspense>
  )
}
