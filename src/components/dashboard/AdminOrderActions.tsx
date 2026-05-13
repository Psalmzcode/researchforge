'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'

const statuses = ['REVIEWING', 'IN_PROGRESS', 'NEEDS_CLARIFICATION', 'PENDING_REVIEW', 'AWAITING_CLIENT_PAYMENT', 'COMPLETED', 'DELIVERED', 'CANCELLED']
const statusLabel: Record<string, string> = {
  REVIEWING: 'Mark Under Review',
  IN_PROGRESS: 'Mark In Progress',
  NEEDS_CLARIFICATION: 'Request Clarification',
  PENDING_REVIEW: 'Pending Review',
  AWAITING_CLIENT_PAYMENT: 'Awaiting client payment',
  COMPLETED: 'Mark Completed',
  DELIVERED: 'Mark Delivered',
  CANCELLED: 'Cancel Order',
}

export function AdminOrderActions({
  order,
  researchers,
  clientProjects,
}: {
  order: any
  researchers: any[]
  clientProjects: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [assignId, setAssignId] = useState(order.assignedTo || '')
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [approving, setApproving] = useState(false)
  const [linkProjectId, setLinkProjectId] = useState(order.projectId || '')
  const [linkSaving, setLinkSaving] = useState(false)

  useEffect(() => {
    setLinkProjectId(order.projectId || '')
  }, [order.projectId])

  async function saveLinkedProject() {
    setLinkSaving(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: linkProjectId || null }),
      })
      if (res.ok) {
        toast.success('Linked project updated.')
        router.refresh()
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not update linked project.')
    } finally {
      setLinkSaving(false)
    }
  }

  async function updateStatus() {
    if (!status) return
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      })
      if (res.ok) {
        toast.success('Order status updated.')
        router.refresh()
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not update status.')
    } finally {
      setLoading(false)
    }
  }

  async function assign() {
    if (!assignId) return
    setAssigning(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ researcherId: assignId }),
      })
      if (res.ok) {
        toast.success('Researcher assigned.')
        router.refresh()
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not assign researcher.')
    } finally {
      setAssigning(false)
    }
  }

  async function approveDelivery() {
    setApproving(true)
    try {
      const res = await fetch(`/api/orders/${order.id}/approve`, { method: 'POST' })
      if (res.ok) {
        toast.success('Delivery approved. Client will be notified.')
        router.refresh()
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not approve delivery.')
    } finally {
      setApproving(false)
    }
  }

  const inp = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none border transition-all focus:border-[var(--accent)]'
  const inpS = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  return (
    <div className="rounded-2xl border p-5 space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <h2 className="font-semibold text-sm">Admin Actions</h2>

      <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}>
        <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
          Linked project (quote & payment gate)
        </label>
        <select
          className={inp}
          style={inpS}
          value={linkProjectId}
          onChange={e => setLinkProjectId(e.target.value)}
        >
          <option value="">None — cannot assign until linked</option>
          {clientProjects.map(p => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
          Assignment and &quot;In progress&quot; require this client&apos;s project to have an <strong>approved quote</strong> and a <strong>fully paid first invoice</strong>. Negotiation can happen in messages; the quote row remains the billing source of truth.
        </p>
        <button
          type="button"
          onClick={saveLinkedProject}
          disabled={linkSaving || (linkProjectId || '') === (order.projectId || '')}
          className="inline-flex w-full items-center justify-center gap-2 py-2 rounded-full text-xs font-bold disabled:opacity-50 transition-all"
          style={{ background: 'rgba(255,255,255,.08)', color: 'var(--text)' }}
        >
          {linkSaving ? (
            <>
              <Spinner size="sm" label="Saving link" />
              <span>Saving…</span>
            </>
          ) : (
            'Save project link'
          )}
        </button>
      </div>

      {order.status === 'PENDING_REVIEW' && (
        <div className="space-y-3 p-4 rounded-xl border-2" style={{ borderColor: '#f0a500', background: 'rgba(240,165,0,.06)' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <div>
              <p className="text-sm font-bold">Deliverables Ready for Review</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {order.deliverables?.length || 0} file(s) uploaded by researcher. Review and approve to notify the client.
              </p>
              <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                If this order is linked to a project with an <strong>unpaid installment</strong> invoice, approval sends a <strong>dashboard preview only</strong> until the balance is paid. Enable optional watermarked downloads per client under <strong>Clients → Preview DL</strong>.
              </p>
            </div>
          </div>
          {order.deliverables?.length > 0 && (
            <div className="space-y-1">
              {order.deliverables.map((d: any) => (
                <a
                  key={d.id}
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg text-xs hover:bg-[rgba(0,198,162,.06)]"
                  style={{ background: 'rgba(255,255,255,.03)' }}
                >
                  <span>📄 {d.name}</span>
                  <span style={{ color: 'var(--accent)' }}>Preview ↗</span>
                </a>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={approveDelivery}
            disabled={approving}
            className="inline-flex w-full items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            {approving ? (
              <>
                <Spinner size="sm" label="Approving" />
                <span>Approving…</span>
              </>
            ) : (
              '✓ Approve & Notify Client'
            )}
          </button>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
          Assign Researcher
        </label>
        <select className={inp} style={inpS} value={assignId} onChange={e => setAssignId(e.target.value)}>
          <option value="">Select researcher…</option>
          {researchers.map(r => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.email})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={assign}
          disabled={assigning || !assignId}
          className="inline-flex w-full items-center justify-center gap-2 py-2 rounded-full text-xs font-bold disabled:opacity-50 transition-all"
          style={{ background: 'rgba(55,138,221,.2)', color: '#378add' }}
        >
          {assigning ? (
            <>
              <Spinner size="sm" label="Assigning" />
              <span>Assigning…</span>
            </>
          ) : (
            '👤 Assign'
          )}
        </button>
        <p className="text-[11px] leading-relaxed pt-1" style={{ color: 'var(--muted)' }}>
          Assigning sets the order to <strong>In progress</strong> and checks the project&apos;s initial invoice is paid.
        </p>
      </div>

      <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
        <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
          Update Status
        </label>
        <select className={inp} style={inpS} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Change status to…</option>
          {statuses.map(s => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <textarea rows={2} className={`${inp} resize-none`} style={inpS} placeholder="Note to client (optional)…" value={note} onChange={e => setNote(e.target.value)} />
        <button
          type="button"
          onClick={updateStatus}
          disabled={loading || !status}
          className="inline-flex w-full items-center justify-center gap-2 py-2 rounded-full text-xs font-bold disabled:opacity-50 transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {loading ? (
            <>
              <Spinner size="sm" label="Updating status" />
              <span>Updating…</span>
            </>
          ) : (
            '✓ Update Status'
          )}
        </button>
      </div>
    </div>
  )
}
