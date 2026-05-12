'use client'
import { useState } from 'react'
export function PayNowButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false)
  async function pay() {
    setLoading(true)
    const res = await fetch('/api/payments', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoiceId }) })
    const data = await res.json()
    if (data.authorizationUrl) window.location.href = data.authorizationUrl
    else { alert('Payment initialization failed'); setLoading(false) }
  }
  return (
    <button onClick={pay} disabled={loading} className="text-[.7rem] font-bold px-2.5 py-1 rounded-full transition-all hover:opacity-90 disabled:opacity-60" style={{background:'var(--accent)',color:'var(--text-on-accent)'}}>
      {loading ? '…' : 'Pay Now'}
    </button>
  )
}
