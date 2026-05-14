'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { getJsonError } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'

export type OrderPayoutSnapshot = {
  id: string
  orderNumber: string
  title: string
  status: string
  budget: number | null
  assignedTo: string | null
  assignee: { name: string | null; email: string } | null
  researcherSharePercent: number | null
  researcherPaidAmount: number | null
  researcherPaidAt: string | null
  researcherPayoutNote: string | null
  opsPayoutAmount: number | null
  opsPaidAt: string | null
  opsPayoutNote: string | null
}

export function OrderPayoutPanel({
  order: initialOrder,
  defaultResearcherSharePercent,
  linkedProjectId,
  projectPayoutHref,
}: {
  order: OrderPayoutSnapshot
  defaultResearcherSharePercent: number
  /** When set, researcher/ops pools are driven from project invoices — use project payout screen. */
  linkedProjectId?: string | null
  /** Link to project payout UI (admin or finance). */
  projectPayoutHref?: string | null
}) {
  const router = useRouter()
  const [order, setOrder] = useState(initialOrder)
  const [shareOverride, setShareOverride] = useState<string>(
    order.researcherSharePercent != null ? String(order.researcherSharePercent) : '',
  )
  const [paidAmount, setPaidAmount] = useState(order.researcherPaidAmount != null ? String(order.researcherPaidAmount) : '')
  const [paidNote, setPaidNote] = useState(order.researcherPayoutNote ?? '')
  const [opsAmount, setOpsAmount] = useState(order.opsPayoutAmount != null ? String(order.opsPayoutAmount) : '')
  const [opsNote, setOpsNote] = useState(order.opsPayoutNote ?? '')
  const [saving, setSaving] = useState(false)

  const effectiveShare = order.researcherSharePercent ?? defaultResearcherSharePercent
  const suggestedResearcher = useMemo(() => {
    const b = order.budget
    if (b == null || Number.isNaN(b)) return null
    return Math.round(b * (effectiveShare / 100) * 100) / 100
  }, [order.budget, effectiveShare])

  async function patch(body: Record<string, unknown>) {
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/payout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        toast.error(await getJsonError(res))
        return
      }
      const next = await res.json()
      setOrder((o) => ({
        ...o,
        researcherSharePercent: next.researcherSharePercent ?? null,
        researcherPaidAmount: next.researcherPaidAmount ?? null,
        researcherPaidAt: next.researcherPaidAt ? new Date(next.researcherPaidAt).toISOString() : null,
        researcherPayoutNote: next.researcherPayoutNote ?? null,
        opsPayoutAmount: next.opsPayoutAmount ?? null,
        opsPaidAt: next.opsPaidAt ? new Date(next.opsPaidAt).toISOString() : null,
        opsPayoutNote: next.opsPayoutNote ?? null,
        assignee: next.assignee ?? o.assignee,
      }))
      setShareOverride(next.researcherSharePercent != null ? String(next.researcherSharePercent) : '')
      setPaidAmount(next.researcherPaidAmount != null ? String(next.researcherPaidAmount) : '')
      setPaidNote(next.researcherPayoutNote ?? '')
      setOpsAmount(next.opsPayoutAmount != null ? String(next.opsPayoutAmount) : '')
      setOpsNote(next.opsPayoutNote ?? '')
      toast.success('Saved.')
      router.refresh()
    } catch {
      toast.error('Could not save.')
    } finally {
      setSaving(false)
    }
  }

  async function saveShare() {
    const trimmed = shareOverride.trim()
    if (trimmed === '') {
      await patch({ researcherSharePercent: null })
      return
    }
    const pct = Number.parseInt(trimmed, 10)
    if (Number.isNaN(pct) || pct < 1 || pct > 100) {
      toast.error('Share must be between 1 and 100, or blank for platform default.')
      return
    }
    await patch({ researcherSharePercent: pct })
  }

  async function saveResearcherPayout() {
    const amt = paidAmount.trim() === '' ? null : Number.parseFloat(paidAmount)
    if (paidAmount.trim() !== '' && (amt == null || Number.isNaN(amt) || amt < 0)) {
      toast.error('Invalid amount.')
      return
    }
    await patch({
      researcherPaidAmount: amt,
      researcherPayoutNote: paidNote.trim() || null,
    })
  }

  async function markResearcherPaidToday() {
    const amt = paidAmount.trim() === '' ? null : Number.parseFloat(paidAmount)
    if (amt == null || Number.isNaN(amt) || amt < 0) {
      toast.error('Enter the amount paid before marking paid.')
      return
    }
    await patch({
      researcherPaidAmount: amt,
      researcherPaidAt: new Date().toISOString(),
      researcherPayoutNote: paidNote.trim() || null,
    })
  }

  async function clearResearcherPaid() {
    await patch({ researcherPaidAt: null, researcherPaidAmount: null })
  }

  async function saveOps() {
    const amt = opsAmount.trim() === '' ? null : Number.parseFloat(opsAmount)
    if (opsAmount.trim() !== '' && (amt == null || Number.isNaN(amt) || amt < 0)) {
      toast.error('Invalid ops amount.')
      return
    }
    await patch({
      opsPayoutAmount: amt,
      opsPayoutNote: opsNote.trim() || null,
    })
  }

  async function markOpsPaidToday() {
    const amt = opsAmount.trim() === '' ? null : Number.parseFloat(opsAmount)
    if (amt == null || Number.isNaN(amt) || amt < 0) {
      toast.error('Enter ops payout amount first.')
      return
    }
    await patch({
      opsPayoutAmount: amt,
      opsPaidAt: new Date().toISOString(),
      opsPayoutNote: opsNote.trim() || null,
    })
  }

  async function clearOpsPaid() {
    await patch({ opsPaidAt: null, opsPayoutAmount: null })
  }

  const inp =
    'w-full rounded-xl px-3 py-2 text-sm outline-none border transition-all focus:border-[var(--accent)]'
  const inpS = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  return (
    <div className="rounded-2xl border p-5 space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div>
        <h2 className="font-semibold text-sm">Order-level payout notes (optional)</h2>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
          Canonical splits use each <strong>project&apos;s collected cash</strong> (paid invoices). Use the project payout
          card when this order is linked to a project.
        </p>
      </div>

      {linkedProjectId && projectPayoutHref && (
        <div className="rounded-xl border p-3 text-xs leading-relaxed" style={{ borderColor: 'rgba(0,198,162,.4)', background: 'rgba(0,198,162,.08)' }}>
          This order is linked to a project. <strong>Researcher and website payouts</strong> should be recorded from{' '}
          <Link href={projectPayoutHref} className="font-bold underline" style={{ color: 'var(--accent)' }}>
            the project payout screen
          </Link>{' '}
          (invoice totals, not budget).
        </div>
      )}

      {!order.assignedTo && (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          No researcher assigned — splits apply once someone is assigned.
        </p>
      )}

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Researcher share (this order)
        </p>
        <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Platform default is <strong>{defaultResearcherSharePercent}%</strong>. Override for this order only (1–100), or leave blank to use the default.
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="number"
            min={1}
            max={100}
            placeholder={`default ${defaultResearcherSharePercent}%`}
            className={inp}
            style={{ ...inpS, maxWidth: '9rem' }}
            value={shareOverride}
            onChange={(e) => setShareOverride(e.target.value)}
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveShare()}
            className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
            style={{ background: 'rgba(55,138,221,.2)', color: '#378add' }}
          >
            Save share
          </button>
        </div>
        <p className="text-xs">
          Effective share: <strong>{effectiveShare}%</strong>
          {!linkedProjectId && order.budget != null && suggestedResearcher != null && (
            <>
              {' '}
              · Legacy hint from order budget: <strong>{formatCurrency(suggestedResearcher)}</strong>
            </>
          )}
        </p>
      </div>

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Researcher payout
        </p>
        {order.assignee && (
          <p className="text-xs">
            Assignee: <strong>{order.assignee.name || '—'}</strong> ({order.assignee.email})
          </p>
        )}
        <input
          type="number"
          min={0}
          step="0.01"
          className={inp}
          style={inpS}
          placeholder="Amount paid (₦)"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
        <textarea
          rows={2}
          className={`${inp} resize-none`}
          style={inpS}
          placeholder="Reference / bank note (optional)"
          value={paidNote}
          onChange={(e) => setPaidNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveResearcherPayout()}
            className="px-4 py-2 rounded-full text-xs font-bold border disabled:opacity-50"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
          >
            Save amount / note
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void markResearcherPaidToday()}
            className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Mark paid today
          </button>
          {order.researcherPaidAt && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void clearResearcherPaid()}
              className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              style={{ color: '#e24b4a' }}
            >
              Clear paid
            </button>
          )}
        </div>
        {order.researcherPaidAt && (
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Recorded paid {formatDate(order.researcherPaidAt)}
            {order.researcherPaidAmount != null && <> · {formatCurrency(order.researcherPaidAmount)}</>}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Platform / website & ops
        </p>
        <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Record what you pay for hosting, site maintenance, or other internal ops tied to this order.
        </p>
        <input
          type="number"
          min={0}
          step="0.01"
          className={inp}
          style={inpS}
          placeholder="Ops payout amount (₦)"
          value={opsAmount}
          onChange={(e) => setOpsAmount(e.target.value)}
        />
        <textarea
          rows={2}
          className={`${inp} resize-none`}
          style={inpS}
          placeholder="What this covers (optional)"
          value={opsNote}
          onChange={(e) => setOpsNote(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveOps()}
            className="px-4 py-2 rounded-full text-xs font-bold border disabled:opacity-50"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
          >
            Save ops
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void markOpsPaidToday()}
            className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
            style={{ background: 'rgba(240,165,0,.25)', color: 'var(--text)' }}
          >
            Mark ops paid today
          </button>
          {order.opsPaidAt && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void clearOpsPaid()}
              className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              style={{ color: '#e24b4a' }}
            >
              Clear ops paid
            </button>
          )}
        </div>
        {order.opsPaidAt && (
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Ops paid {formatDate(order.opsPaidAt)}
            {order.opsPayoutAmount != null && <> · {formatCurrency(order.opsPayoutAmount)}</>}
          </p>
        )}
      </div>
    </div>
  )
}
