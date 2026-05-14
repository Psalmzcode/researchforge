'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getJsonError } from '@/lib/api-error'

/** Bank account where website / ops payouts are sent (one platform payee). Admin-only save. */
export function WebsiteManagerPayoutDetails() {
  const [bank, setBank] = useState('')
  const [number, setNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/app-settings')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setBank(data.websitePayoutBankName ?? '')
          setNumber(data.websitePayoutAccountNumber ?? '')
          setHolder(data.websitePayoutAccountHolder ?? '')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/app-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websitePayoutBankName: bank.trim() || null,
          websitePayoutAccountNumber: number.trim() || null,
          websitePayoutAccountHolder: holder.trim() || null,
        }),
      })
      if (res.ok) {
        toast.success('Website / ops payout account saved.')
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-xs" style={{ color: 'var(--muted)' }}>Loading…</p>

  const inp =
    'w-full rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]'
  const inpS = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Used when you <strong>initiate</strong> a website/ops payout on a project — finance/admin see where to send
        that share. Optional until you start paying that way.
      </p>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Bank name</label>
        <input value={bank} onChange={(e) => setBank(e.target.value)} className={inp} style={inpS} placeholder="e.g. GTBank" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Account number</label>
        <input value={number} onChange={(e) => setNumber(e.target.value)} className={inp} style={inpS} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Account name</label>
        <input value={holder} onChange={(e) => setHolder(e.target.value)} className={inp} style={inpS} />
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
        style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
