'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getJsonError } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'
import { computeProjectPayoutPreview, describeProjectPayoutSample } from '@/lib/project-payout-math'
import type { ResearcherPayeeRow } from '@/lib/researcher-payout-payees'

export type { ResearcherPayeeRow }

export type ProjectAssignmentRow = {
  id: string
  userId: string
  completedAt: string | null
  user: { name: string | null; email: string }
}

export type WebsitePayoutRecipient = {
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
}

export type ProjectPayoutSnapshot = {
  researcherSharePercent: number | null
  websiteOpsSharePercent: number | null
  researcherPayoutInitiatedAt: string | null
  opsPayoutInitiatedAt: string | null
  researcherPayoutTotalRecorded: number | null
  researcherPayoutPaidAt: string | null
  researcherPayoutNote: string | null
  opsPayoutTotalRecorded: number | null
  opsPayoutPaidAt: string | null
  opsPayoutNote: string | null
}

export function ProjectPayoutPanel({
  projectId,
  projectTitle: _projectTitle,
  projectStatus,
  collectedRevenue,
  assignments,
  defaults,
  initialSnapshot,
  researcherPayeeRows,
  websitePayoutRecipient,
}: {
  projectId: string
  projectTitle: string
  projectStatus: string
  collectedRevenue: number
  assignments: ProjectAssignmentRow[]
  defaults: { researcher: number; websiteOps: number }
  initialSnapshot: ProjectPayoutSnapshot
  researcherPayeeRows: ResearcherPayeeRow[]
  websitePayoutRecipient: WebsitePayoutRecipient
}) {
  const router = useRouter()
  const [snap, setSnap] = useState(initialSnapshot)
  const [shareR, setShareR] = useState(snap.researcherSharePercent != null ? String(snap.researcherSharePercent) : '')
  const [shareW, setShareW] = useState(snap.websiteOpsSharePercent != null ? String(snap.websiteOpsSharePercent) : '')
  const [rPaid, setRPaid] = useState(snap.researcherPayoutTotalRecorded != null ? String(snap.researcherPayoutTotalRecorded) : '')
  const [rNote, setRNote] = useState(snap.researcherPayoutNote ?? '')
  const [oPaid, setOPaid] = useState(snap.opsPayoutTotalRecorded != null ? String(snap.opsPayoutTotalRecorded) : '')
  const [oNote, setONote] = useState(snap.opsPayoutNote ?? '')
  const [saving, setSaving] = useState(false)

  const completedResearcherCount = useMemo(
    () => assignments.filter((a) => a.completedAt != null).length,
    [assignments],
  )

  const preview = useMemo(
    () =>
      computeProjectPayoutPreview({
        collectedRevenue,
        defaultResearcherShare: defaults.researcher,
        defaultWebsiteOpsShare: defaults.websiteOps,
        projectResearcherShare: snap.researcherSharePercent,
        projectWebsiteOpsShare: snap.websiteOpsSharePercent,
        completedResearcherCount,
        projectIsComplete: projectStatus === 'COMPLETE',
      }),
    [
      collectedRevenue,
      defaults.researcher,
      defaults.websiteOps,
      snap.researcherSharePercent,
      snap.websiteOpsSharePercent,
      completedResearcherCount,
      projectStatus,
    ],
  )

  const sample = useMemo(() => describeProjectPayoutSample(formatCurrency), [])

  async function patch(body: Record<string, unknown>, successToast: string | false = 'Saved.') {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/payout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        toast.error(await getJsonError(res))
        return
      }
      const next = await res.json()
      setSnap({
        researcherSharePercent: next.researcherSharePercent ?? null,
        websiteOpsSharePercent: next.websiteOpsSharePercent ?? null,
        researcherPayoutInitiatedAt: next.researcherPayoutInitiatedAt
          ? new Date(next.researcherPayoutInitiatedAt).toISOString()
          : null,
        opsPayoutInitiatedAt: next.opsPayoutInitiatedAt ? new Date(next.opsPayoutInitiatedAt).toISOString() : null,
        researcherPayoutTotalRecorded: next.researcherPayoutTotalRecorded ?? null,
        researcherPayoutPaidAt: next.researcherPayoutPaidAt ? new Date(next.researcherPayoutPaidAt).toISOString() : null,
        researcherPayoutNote: next.researcherPayoutNote ?? null,
        opsPayoutTotalRecorded: next.opsPayoutTotalRecorded ?? null,
        opsPayoutPaidAt: next.opsPayoutPaidAt ? new Date(next.opsPayoutPaidAt).toISOString() : null,
        opsPayoutNote: next.opsPayoutNote ?? null,
      })
      setShareR(next.researcherSharePercent != null ? String(next.researcherSharePercent) : '')
      setShareW(next.websiteOpsSharePercent != null ? String(next.websiteOpsSharePercent) : '')
      setRPaid(next.researcherPayoutTotalRecorded != null ? String(next.researcherPayoutTotalRecorded) : '')
      setRNote(next.researcherPayoutNote ?? '')
      setOPaid(next.opsPayoutTotalRecorded != null ? String(next.opsPayoutTotalRecorded) : '')
      setONote(next.opsPayoutNote ?? '')
      if (successToast !== false) toast.success(successToast)
      router.refresh()
    } catch {
      toast.error('Could not save.')
    } finally {
      setSaving(false)
    }
  }

  async function saveShares() {
    const tr = shareR.trim()
    const tw = shareW.trim()
    const rPct = tr === '' ? null : Number.parseInt(tr, 10)
    const wPct = tw === '' ? null : Number.parseInt(tw, 10)
    if (tr !== '' && (rPct === null || Number.isNaN(rPct) || rPct < 1 || rPct > 100)) {
      toast.error('Researcher share must be 1–100 or blank.')
      return
    }
    if (tw !== '' && (wPct === null || Number.isNaN(wPct) || wPct < 1 || wPct > 100)) {
      toast.error('Website ops share must be 1–100 or blank.')
      return
    }
    await patch({ researcherSharePercent: rPct, websiteOpsSharePercent: wPct })
  }

  async function saveResearcherRecorded() {
    const amt = rPaid.trim() === '' ? null : Number.parseFloat(rPaid)
    if (rPaid.trim() !== '' && (amt == null || Number.isNaN(amt) || amt < 0)) {
      toast.error('Invalid researcher total.')
      return
    }
    await patch({ researcherPayoutTotalRecorded: amt, researcherPayoutNote: rNote.trim() || null })
  }

  async function markResearcherPaidToday() {
    const amt = rPaid.trim() === '' ? null : Number.parseFloat(rPaid)
    if (amt == null || Number.isNaN(amt) || amt < 0) {
      toast.error('Enter total paid to researchers first.')
      return
    }
    await patch({
      researcherPayoutTotalRecorded: amt,
      researcherPayoutPaidAt: new Date().toISOString(),
      researcherPayoutNote: rNote.trim() || null,
    })
  }

  async function clearResearcherPaid() {
    await patch({ researcherPayoutPaidAt: null, researcherPayoutTotalRecorded: null })
  }

  async function saveOpsRecorded() {
    const amt = oPaid.trim() === '' ? null : Number.parseFloat(oPaid)
    if (oPaid.trim() !== '' && (amt == null || Number.isNaN(amt) || amt < 0)) {
      toast.error('Invalid ops total.')
      return
    }
    await patch({ opsPayoutTotalRecorded: amt, opsPayoutNote: oNote.trim() || null })
  }

  async function markOpsPaidToday() {
    const amt = oPaid.trim() === '' ? null : Number.parseFloat(oPaid)
    if (amt == null || Number.isNaN(amt) || amt < 0) {
      toast.error('Enter ops payout amount first.')
      return
    }
    await patch({
      opsPayoutTotalRecorded: amt,
      opsPayoutPaidAt: new Date().toISOString(),
      opsPayoutNote: oNote.trim() || null,
    })
  }

  async function clearOpsPaid() {
    await patch({ opsPayoutPaidAt: null, opsPayoutTotalRecorded: null })
  }

  async function initiateResearcherPayout() {
    await patch(
      {
        researcherPayoutInitiatedAt: new Date().toISOString(),
        researcherPayoutTotalRecorded: preview.researcherPool,
      },
      'Researcher payout initiated. Pay each share or the total, then mark paid when done.',
    )
  }

  async function clearResearcherInitiate() {
    await patch({ researcherPayoutInitiatedAt: null })
  }

  async function initiateOpsPayout() {
    await patch(
      {
        opsPayoutInitiatedAt: new Date().toISOString(),
        opsPayoutTotalRecorded: preview.websiteOpsPool,
      },
      'Website / ops payout initiated.',
    )
  }

  async function clearOpsInitiate() {
    await patch({ opsPayoutInitiatedAt: null })
  }

  const inp =
    'w-full rounded-xl px-3 py-2 text-sm outline-none border transition-all focus:border-[var(--accent)]'
  const inpS = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  const hasWebBank =
    Boolean(websitePayoutRecipient.bankName) &&
    Boolean(websitePayoutRecipient.accountNumber) &&
    Boolean(websitePayoutRecipient.accountHolder)

  return (
    <div className="rounded-2xl border p-5 space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div>
        <h2 className="font-semibold text-sm">Project payouts (invoice cash, not budget)</h2>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
          Amounts show <strong>what each side should receive</strong>. You can pay <strong>cash manually</strong> using
          those figures, or click <strong>Initiate</strong> to flag a payout run and copy suggested totals into the
          record fields. <strong>Bank details</strong> for researchers live on each researcher under Team → Edit; for
          the website manager, set the platform account under Admin → Settings.
        </p>
      </div>

      <div
        className="rounded-xl border p-4 space-y-2 text-[11px] leading-relaxed"
        style={{ borderColor: 'rgba(0,198,162,.35)', background: 'rgba(0,198,162,.06)' }}
      >
        <p className="font-semibold text-xs" style={{ color: 'var(--accent)' }}>
          Sample (so the rule is obvious)
        </p>
        <p style={{ color: 'var(--muted)' }}>{sample.line1}</p>
        <p style={{ color: 'var(--muted)' }}>{sample.line2}</p>
        <p style={{ color: 'var(--muted)' }}>{sample.line3}</p>
        <p style={{ color: 'var(--muted)' }}>{sample.line4}</p>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold">This project</p>
        <p className="text-sm">
          Collected (paid invoices): <strong>{formatCurrency(collectedRevenue)}</strong>
        </p>
        {!preview.payoutEligible && (
          <p className="text-[11px]" style={{ color: '#f0a500' }}>
            Mark the project <strong>Complete</strong> and ensure invoices are <strong>PAID</strong> before you treat
            suggested amounts as final for payout.
          </p>
        )}
        <ul className="text-xs space-y-1 list-disc pl-4" style={{ color: 'var(--muted)' }}>
          <li>
            Researcher pool ({preview.effectiveResearcherShare}% of collected):{' '}
            <strong>{formatCurrency(preview.researcherPool)}</strong>
            {preview.completedResearcherCount > 0 && (
              <>
                {' '}
                → ~<strong>{formatCurrency(preview.perResearcherIfSplitEvenly)}</strong> each for{' '}
                {preview.completedResearcherCount} completed researcher assignment(s)
              </>
            )}
          </li>
          <li>
            Remainder after researchers:{' '}
            <strong>{formatCurrency(Math.max(0, collectedRevenue - preview.researcherPool))}</strong>
          </li>
          <li>
            Website / ops ({preview.effectiveWebsiteOpsShare}% of that remainder):{' '}
            <strong>{formatCurrency(preview.websiteOpsPool)}</strong>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold">Who to pay (suggested + account details)</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[11px]">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>
                <th className="pb-2 pr-2 font-medium">Recipient</th>
                <th className="pb-2 pr-2 font-medium">Suggested</th>
                <th className="pb-2 font-medium">Bank details</th>
              </tr>
            </thead>
            <tbody>
              {researcherPayeeRows.map((row) => (
                <tr key={row.assignmentId} className="border-b align-top" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="py-2 pr-2">
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      {row.name}
                    </span>
                    <br />
                    <span style={{ color: 'var(--muted)' }}>{row.email}</span>
                    {!row.completed && (
                      <span className="block text-[10px] mt-0.5" style={{ color: '#f0a500' }}>
                        Assignment not completed — split excludes this row.
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {row.completed ? (
                      <strong>{formatCurrency(row.suggested)}</strong>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td className="py-2" style={{ color: 'var(--muted)' }}>
                    {row.completed ? (
                      row.bankName && row.accountNumber && row.accountHolder ? (
                        <>
                          {row.bankName} · {row.accountNumber}
                          <br />
                          {row.accountHolder}
                        </>
                      ) : (
                        <span style={{ color: '#f0a500' }}>
                          Missing — add under <strong>Team → Edit</strong> for this researcher.
                        </span>
                      )
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              <tr className="align-top">
                <td className="py-2 pr-2">
                  <span className="font-medium" style={{ color: 'var(--text)' }}>
                    Website / ops
                  </span>
                </td>
                <td className="py-2 pr-2 whitespace-nowrap">
                  <strong>{formatCurrency(preview.websiteOpsPool)}</strong>
                </td>
                <td className="py-2" style={{ color: 'var(--muted)' }}>
                  {hasWebBank ? (
                    <>
                      {websitePayoutRecipient.bankName} · {websitePayoutRecipient.accountNumber}
                      <br />
                      {websitePayoutRecipient.accountHolder}
                    </>
                  ) : (
                    <span style={{ color: '#f0a500' }}>
                      Missing — add under <strong>Settings → Website / ops payout account</strong>.
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-semibold mb-2">Researcher payout</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || preview.researcherPool <= 0}
              onClick={() => void initiateResearcherPayout()}
              className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(55,138,221,.2)', color: '#378add' }}
            >
              Initiate researcher payout
            </button>
            {snap.researcherPayoutInitiatedAt && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void clearResearcherInitiate()}
                className="px-3 py-2 rounded-full text-xs font-bold"
                style={{ color: '#e24b4a' }}
              >
                Clear initiate
              </button>
            )}
          </div>
          {snap.researcherPayoutInitiatedAt && (
            <p className="text-[10px] mt-2" style={{ color: 'var(--muted)' }}>
              Initiated {formatDate(snap.researcherPayoutInitiatedAt)} — pay each share (or total), then mark paid below.
            </p>
          )}
        </div>
        <div className="min-w-[200px] flex-1">
          <p className="text-xs font-semibold mb-2">Website / ops payout</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || preview.websiteOpsPool <= 0}
              onClick={() => void initiateOpsPayout()}
              className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              style={{ background: 'rgba(240,165,0,.25)', color: 'var(--text)' }}
            >
              Initiate web / ops payout
            </button>
            {snap.opsPayoutInitiatedAt && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void clearOpsInitiate()}
                className="px-3 py-2 rounded-full text-xs font-bold"
                style={{ color: '#e24b4a' }}
              >
                Clear initiate
              </button>
            )}
          </div>
          {snap.opsPayoutInitiatedAt && (
            <p className="text-[10px] mt-2" style={{ color: 'var(--muted)' }}>
              Initiated {formatDate(snap.opsPayoutInitiatedAt)} — transfer to platform account, then mark paid below.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Researcher assignments
        </p>
        {assignments.length === 0 && <p className="text-xs" style={{ color: 'var(--muted)' }}>No researcher assignments.</p>}
        <ul className="text-xs space-y-1">
          {assignments.map((a) => (
            <li key={a.id} style={{ color: 'var(--muted)' }}>
              {a.user.name || a.user.email} — {a.completedAt ? <span style={{ color: 'var(--accent)' }}>completed</span> : 'in progress'}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Overrides for this project (blank = platform defaults: {defaults.researcher}% of collected / {defaults.websiteOps}%
          of remainder)
        </p>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted)' }}>
              Researcher %
            </label>
            <input
              type="number"
              min={1}
              max={100}
              className={inp}
              style={{ ...inpS, width: '6rem' }}
              placeholder={`${defaults.researcher}`}
              value={shareR}
              onChange={(e) => setShareR(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] block mb-0.5" style={{ color: 'var(--muted)' }}>
              Website / ops % of remainder
            </label>
            <input
              type="number"
              min={1}
              max={100}
              className={inp}
              style={{ ...inpS, width: '6rem' }}
              placeholder={`${defaults.websiteOps}`}
              value={shareW}
              onChange={(e) => setShareW(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveShares()}
            className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50"
            style={{ background: 'rgba(55,138,221,.2)', color: '#378add' }}
          >
            Save %
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Record researcher payouts (total — after cash or transfer)
        </p>
        <input type="number" min={0} step="0.01" className={inp} style={inpS} placeholder="Total paid (₦)" value={rPaid} onChange={(e) => setRPaid(e.target.value)} />
        <textarea rows={2} className={`${inp} resize-none`} style={inpS} placeholder="Bank ref / note" value={rNote} onChange={(e) => setRNote(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => void saveResearcherRecorded()} className="px-4 py-2 rounded-full text-xs font-bold border disabled:opacity-50" style={{ borderColor: 'var(--card-border)' }}>
            Save
          </button>
          <button type="button" disabled={saving} onClick={() => void markResearcherPaidToday()} className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
            Mark paid today
          </button>
          {snap.researcherPayoutPaidAt && (
            <button type="button" disabled={saving} onClick={() => void clearResearcherPaid()} className="text-xs font-bold" style={{ color: '#e24b4a' }}>
              Clear
            </button>
          )}
        </div>
        {snap.researcherPayoutPaidAt && (
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Recorded {formatDate(snap.researcherPayoutPaidAt)}
            {snap.researcherPayoutTotalRecorded != null && <> · {formatCurrency(snap.researcherPayoutTotalRecorded)}</>}
          </p>
        )}
      </div>

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          Record website / ops payout
        </p>
        <input type="number" min={0} step="0.01" className={inp} style={inpS} placeholder="Total paid (₦)" value={oPaid} onChange={(e) => setOPaid(e.target.value)} />
        <textarea rows={2} className={`${inp} resize-none`} style={inpS} placeholder="What this covered" value={oNote} onChange={(e) => setONote(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => void saveOpsRecorded()} className="px-4 py-2 rounded-full text-xs font-bold border disabled:opacity-50" style={{ borderColor: 'var(--card-border)' }}>
            Save
          </button>
          <button type="button" disabled={saving} onClick={() => void markOpsPaidToday()} className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50" style={{ background: 'rgba(240,165,0,.25)' }}>
            Mark paid today
          </button>
          {snap.opsPayoutPaidAt && (
            <button type="button" disabled={saving} onClick={() => void clearOpsPaid()} className="text-xs font-bold" style={{ color: '#e24b4a' }}>
              Clear
            </button>
          )}
        </div>
        {snap.opsPayoutPaidAt && (
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Ops paid {formatDate(snap.opsPayoutPaidAt)}
            {snap.opsPayoutTotalRecorded != null && <> · {formatCurrency(snap.opsPayoutTotalRecorded)}</>}
          </p>
        )}
      </div>
    </div>
  )
}
