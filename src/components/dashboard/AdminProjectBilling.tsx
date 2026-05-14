'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'

export type QuoteRow = {
  id: string
  amount: number
  description: string | null
  paymentType: string
  approved: boolean
  approvedAt: string | null
  createdAt: string
  validUntil: string | null
}

export type InvoiceRow = {
  id: string
  number: string
  amount: number
  amountPaid: number
  status: string
  paymentType: string
  dueDate: string | null
  quoteId: string | null
}

export function AdminProjectBilling({
  projectId,
  initialQuotes,
  initialInvoices,
}: {
  projectId: string
  initialQuotes: QuoteRow[]
  initialInvoices: InvoiceRow[]
}) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState<'FULL' | 'INSTALLMENT'>('FULL')
  const [description, setDescription] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [creating, setCreating] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const inp = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none border transition-all focus:border-[var(--accent)]'
  const inpS = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  async function createQuote() {
    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Enter a valid quote amount greater than zero.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          amount: n,
          paymentType,
          description: description.trim() || undefined,
          validUntil: validUntil || undefined,
        }),
      })
      if (!res.ok) {
        toast.error(await getJsonError(res))
        return
      }
      toast.success('Quote saved. Approve it to create the first invoice.')
      setAmount('')
      setDescription('')
      setValidUntil('')
      router.refresh()
    } catch {
      toast.error('Could not create quote.')
    } finally {
      setCreating(false)
    }
  }

  async function approveQuote(quoteId: string) {
    setApprovingId(quoteId)
    try {
      const res = await fetch('/api/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      })
      if (!res.ok) {
        toast.error(await getJsonError(res))
        return
      }
      toast.success('Quote approved — first invoice created and sent to the client.')
      router.refresh()
    } catch {
      toast.error('Could not approve quote.')
    } finally {
      setApprovingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border p-5 space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div>
          <h2 className="font-semibold text-sm">Quotes & first invoice</h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
            Negotiate off-site or in order messages, then record the agreed price here. When you <strong>approve</strong> a quote,
            the system creates the <strong>first invoice</strong> (full amount, or 50% for installment). The client pays from{' '}
            <strong>Client → Invoices</strong>.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Amount (₦) *
            </label>
            <input
              type="number"
              min={1}
              step={1}
              className={`${inp} mt-1`}
              style={inpS}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 900000"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Payment type *
            </label>
            <select className={`${inp} mt-1`} style={inpS} value={paymentType} onChange={(e) => setPaymentType(e.target.value as 'FULL' | 'INSTALLMENT')}>
              <option value="FULL">Full payment</option>
              <option value="INSTALLMENT">Installment (50% now)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Quote valid until
            </label>
            <input type="date" className={`${inp} mt-1`} style={inpS} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            Notes (optional)
          </label>
          <textarea
            rows={2}
            className={`${inp} mt-1 resize-y`}
            style={inpS}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope summary, reference to email thread, etc."
          />
        </div>
        <button
          type="button"
          onClick={() => void createQuote()}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {creating ? <Spinner size="sm" label="Saving" /> : null}
          {creating ? 'Saving…' : 'Save quote (draft)'}
        </button>

        <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            Quotes on this project
          </h3>
          {initialQuotes.length === 0 ? (
            <p className="text-xs py-2" style={{ color: 'var(--muted)' }}>
              No quotes yet — add one above, then approve it to generate the invoice.
            </p>
          ) : (
            <ul className="space-y-2">
              {initialQuotes.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.02)' }}
                >
                  <div className="text-xs space-y-0.5">
                    <p className="font-mono font-bold" style={{ color: 'var(--accent)' }}>
                      {formatCurrency(q.amount)} · {q.paymentType}
                      {q.approved ? (
                        <span className="ml-2 font-sans font-semibold text-[10px]" style={{ color: '#00c6a2' }}>
                          Approved
                        </span>
                      ) : (
                        <span className="ml-2 font-sans font-semibold text-[10px]" style={{ color: '#f0a500' }}>
                          Draft
                        </span>
                      )}
                    </p>
                    {q.description && <p style={{ color: 'var(--muted)' }}>{q.description}</p>}
                    <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                      Created {formatDate(q.createdAt)}
                      {q.approvedAt ? ` · Approved ${formatDate(q.approvedAt)}` : ''}
                    </p>
                  </div>
                  {!q.approved && (
                    <button
                      type="button"
                      onClick={() => void approveQuote(q.id)}
                      disabled={approvingId === q.id}
                      className="shrink-0 rounded-full px-4 py-2 text-[11px] font-bold disabled:opacity-50"
                      style={{ background: 'rgba(0,198,162,.2)', color: '#00c6a2' }}
                    >
                      {approvingId === q.id ? (
                        <span className="inline-flex items-center gap-1">
                          <Spinner size="sm" label="Approving" /> Approving…
                        </span>
                      ) : (
                        'Approve → create invoice'
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <h2 className="font-semibold text-sm mb-3">Invoices for this project</h2>
        {initialInvoices.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            No invoices yet. Approve a quote to create the first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                  {['Invoice #', 'Amount', 'Paid', 'Balance', 'Type', 'Due', 'Status'].map((h) => (
                    <th key={h} className="text-left px-2 py-2 font-medium" style={{ color: 'var(--muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                    <td className="px-2 py-2 font-mono font-bold" style={{ color: 'var(--accent)' }}>
                      {inv.number}
                    </td>
                    <td className="px-2 py-2">{formatCurrency(inv.amount)}</td>
                    <td className="px-2 py-2" style={{ color: 'var(--accent)' }}>
                      {formatCurrency(inv.amountPaid)}
                    </td>
                    <td className="px-2 py-2" style={{ color: inv.amount > inv.amountPaid ? '#e24b4a' : 'var(--muted)' }}>
                      {formatCurrency(inv.amount - inv.amountPaid)}
                    </td>
                    <td className="px-2 py-2" style={{ color: 'var(--muted)' }}>
                      {inv.paymentType}
                    </td>
                    <td className="px-2 py-2" style={{ color: 'var(--muted)' }}>
                      {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                    </td>
                    <td className="px-2 py-2 font-semibold">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] mt-3" style={{ color: 'var(--muted)' }}>
          All project invoices also appear under <strong>Admin → Invoices</strong>. Client pays via <strong>Client → Invoices</strong> (Paystack).
        </p>
      </section>
    </div>
  )
}
