'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getJsonError } from '@/lib/api-error'

export function DefaultResearcherShareSettings() {
  const [pct, setPct] = useState(40)
  const [opsPct, setOpsPct] = useState(15)
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
          if (typeof data.defaultResearcherSharePercent === 'number') setPct(data.defaultResearcherSharePercent)
          if (typeof data.defaultWebsiteOpsSharePercent === 'number') setOpsPct(data.defaultWebsiteOpsSharePercent)
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
          defaultResearcherSharePercent: pct,
          defaultWebsiteOpsSharePercent: opsPct,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPct(data.defaultResearcherSharePercent)
        setOpsPct(data.defaultWebsiteOpsSharePercent ?? 15)
        toast.success('Payout defaults updated.')
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-xs" style={{ color: 'var(--muted)' }}>Loading…</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        These defaults apply to <strong>completed projects</strong> using <strong>cash collected</strong> (paid
        invoices). Researcher % is of collected; website / ops % is of the <strong>remainder after</strong> that
        researcher slice. Per-project overrides live on each project&apos;s payout card.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
            Default researcher share (% of collected)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            className="w-28 rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
            style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
            value={pct}
            onChange={(e) => setPct(Number.parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
            Default website / ops share (% of remainder after researchers)
          </label>
          <input
            type="number"
            min={1}
            max={100}
            className="w-28 rounded-xl px-3 py-2 text-sm border outline-none focus:border-[var(--accent)]"
            style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
            value={opsPct}
            onChange={(e) => setOpsPct(Number.parseInt(e.target.value, 10) || 1)}
          />
        </div>
        <button
          type="button"
          disabled={saving || pct < 1 || pct > 100 || opsPct < 1 || opsPct > 100}
          onClick={() => void save()}
          className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
