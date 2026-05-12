'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const statuses = ['REVIEWING','IN_PROGRESS','NEEDS_CLARIFICATION','PENDING_REVIEW','AWAITING_CLIENT_PAYMENT','COMPLETED','DELIVERED','CANCELLED']
const statusLabel: Record<string,string> = {
  REVIEWING:'Mark Under Review',
  IN_PROGRESS:'Mark In Progress',
  NEEDS_CLARIFICATION:'Request Clarification',
  PENDING_REVIEW:'Pending Review',
  AWAITING_CLIENT_PAYMENT:'Awaiting client payment',
  COMPLETED:'Mark Completed',
  DELIVERED:'Mark Delivered',
  CANCELLED:'Cancel Order',
}

export function AdminOrderActions({ order, researchers }: { order: any; researchers: any[] }) {
  const router = useRouter()
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [assignId, setAssignId] = useState(order.assignedTo || '')
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [approving, setApproving] = useState(false)

  async function updateStatus() {
    if (!status) return
    setLoading(true)
    await fetch(`/api/orders/${order.id}/status`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status, note }) })
    setLoading(false); router.refresh()
  }

  async function assign() {
    if (!assignId) return
    setAssigning(true)
    await fetch(`/api/orders/${order.id}/assign`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ researcherId: assignId }) })
    setAssigning(false); router.refresh()
  }

  async function approveDelivery() {
    setApproving(true)
    await fetch(`/api/orders/${order.id}/approve`, { method: 'POST' })
    setApproving(false); router.refresh()
  }

  const inp = "w-full rounded-xl px-3 py-2.5 text-sm outline-none border transition-all focus:border-[var(--accent)]"
  const inpS = { background:'rgba(255,255,255,.05)', borderColor:'var(--card-border)', color:'var(--text)' }

  return (
    <div className="rounded-2xl border p-5 space-y-5" style={{ background:'var(--card-bg)',borderColor:'var(--card-border)' }}>
      <h2 className="font-semibold text-sm">Admin Actions</h2>

      {/* Approve deliverables — shown when researcher has uploaded */}
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
                <a key={d.id} href={d.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg text-xs hover:bg-[rgba(0,198,162,.06)]"
                  style={{ background: 'rgba(255,255,255,.03)' }}>
                  <span>📄 {d.name}</span>
                  <span style={{ color: 'var(--accent)' }}>Preview ↗</span>
                </a>
              ))}
            </div>
          )}
          <button
            onClick={approveDelivery}
            disabled={approving}
            className="w-full py-2.5 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            {approving ? 'Approving…' : '✓ Approve & Notify Client'}
          </button>
        </div>
      )}

      {/* Assign researcher */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wide" style={{ color:'var(--muted)' }}>Assign Researcher</label>
        <select className={inp} style={inpS} value={assignId} onChange={e=>setAssignId(e.target.value)}>
          <option value="">Select researcher…</option>
          {researchers.map(r=><option key={r.id} value={r.id}>{r.name} ({r.email})</option>)}
        </select>
        <button onClick={assign} disabled={assigning||!assignId} className="w-full py-2 rounded-full text-xs font-bold disabled:opacity-50 transition-all" style={{ background:'rgba(55,138,221,.2)',color:'#378add' }}>
          {assigning ? 'Assigning…' : '👤 Assign'}
        </button>
      </div>

      {/* Update status */}
      <div className="space-y-2 border-t pt-4" style={{ borderColor:'var(--card-border)' }}>
        <label className="text-xs font-semibold tracking-wide" style={{ color:'var(--muted)' }}>Update Status</label>
        <select className={inp} style={inpS} value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">Change status to…</option>
          {statuses.map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
        <textarea rows={2} className={`${inp} resize-none`} style={inpS} placeholder="Note to client (optional)…" value={note} onChange={e=>setNote(e.target.value)}/>
        <button onClick={updateStatus} disabled={loading||!status} className="w-full py-2 rounded-full text-xs font-bold disabled:opacity-50 transition-all hover:-translate-y-0.5" style={{ background:'var(--accent)',color:'var(--text-on-accent)' }}>
          {loading ? 'Updating…' : '✓ Update Status'}
        </button>
      </div>
    </div>
  )
}
