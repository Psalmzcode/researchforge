import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'
import { OrderMessages } from '@/components/dashboard/OrderMessages'
import { DownloadButton } from '@/components/dashboard/DownloadButton'
import { DeliverablePreviewPanel } from '@/components/dashboard/DeliverablePreviewPanel'
import { WatermarkedDownloadButton } from '@/components/dashboard/WatermarkedDownloadButton'
import { PayNowButton } from '@/components/dashboard/PayNowButton'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Client-facing 4-step tracker — maps internal statuses to a clean view
const clientSteps = ['SUBMITTED', 'IN_PROGRESS', 'QUALITY_REVIEW', 'COMPLETED'] as const
const clientStepLabel: Record<string, string> = {
  SUBMITTED: 'Submitted',
  IN_PROGRESS: 'In Progress',
  QUALITY_REVIEW: 'Quality Review',
  COMPLETED: 'Completed',
}
const clientStepIcon: Record<string, string> = {
  SUBMITTED: '📤',
  IN_PROGRESS: '⚙️',
  QUALITY_REVIEW: '🔍',
  COMPLETED: '✅',
}
const clientStepDesc: Record<string, string> = {
  SUBMITTED: 'We received your order',
  IN_PROGRESS: 'Our team is working on it',
  QUALITY_REVIEW: 'Final quality check',
  COMPLETED: 'Ready for you',
}

/** Map the real DB status to the client-facing step */
function toClientStep(status: string): string {
  switch (status) {
    case 'SUBMITTED': return 'SUBMITTED'
    case 'REVIEWING': return 'SUBMITTED'
    case 'IN_PROGRESS': return 'IN_PROGRESS'
    case 'NEEDS_CLARIFICATION': return 'IN_PROGRESS'
    case 'PENDING_REVIEW': return 'QUALITY_REVIEW'
    case 'AWAITING_CLIENT_PAYMENT': return 'COMPLETED'
    case 'COMPLETED': return 'COMPLETED'
    case 'DELIVERED': return 'COMPLETED'
    case 'CANCELLED': return 'SUBMITTED'
    default: return 'SUBMITTED'
  }
}

// Labels for the timeline sidebar (more specific)
const timelineLabel: Record<string, string> = {
  SUBMITTED: 'Order Submitted',
  REVIEWING: 'Under Review',
  IN_PROGRESS: 'Work In Progress',
  NEEDS_CLARIFICATION: 'Clarification Needed',
  PENDING_REVIEW: 'Quality Review',
  AWAITING_CLIENT_PAYMENT: 'Payment due — preview available',
  COMPLETED: 'Work Completed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export default async function ClientOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, email: true, organization: true, allowWatermarkedDeliverableDownload: true } },
      assignee: { select: { name: true } },
      briefFiles: true,
      deliverables: true,
      messages: { where: { isInternal: false, deletedAt: null }, include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
      timeline: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) notFound()
  if (order.clientId !== user.id && user.role !== 'ADMIN') redirect('/dashboard/client')

  const pendingInstallmentInvoices =
    order.projectId && order.status === 'AWAITING_CLIENT_PAYMENT'
      ? await db.invoice.findMany({
          where: {
            clientId: order.clientId,
            projectId: order.projectId,
            paymentType: 'INSTALLMENT',
            status: { notIn: ['PAID', 'CANCELLED'] },
          },
          orderBy: { createdAt: 'asc' },
        })
      : []

  const unpaidInvoices = pendingInstallmentInvoices.filter((i) => i.amountPaid < i.amount - 0.01)

  const clientStep = toClientStep(order.status)
  const currentStepIdx = clientSteps.indexOf(clientStep as typeof clientSteps[number])
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard/client/orders" className="text-xs font-medium" style={{ color: 'var(--muted)' }}>← My Orders</Link>
          <h1 className="font-serif text-2xl font-bold mt-1">{order.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>{order.orderNumber}</span>
            <StatusBadge status={order.status}/>
            {order.assignee && <span className="text-xs" style={{ color: 'var(--muted)' }}>Assigned to {order.assignee.name}</span>}
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-sm">Order Progress</h2>
          {isCancelled && <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(226,75,74,.12)', color: '#e24b4a' }}>Cancelled</span>}
        </div>
        {!isCancelled && (
          <div className="relative flex items-start justify-between">
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px]" style={{ background: 'var(--card-border)' }}>
              <div className="h-full transition-all duration-700" style={{ width: `${Math.max(0, (currentStepIdx / (clientSteps.length - 1)) * 100)}%`, background: 'var(--accent)' }}/>
            </div>
            {clientSteps.map((step, i) => {
              const done = i <= currentStepIdx
              const active = i === currentStepIdx
              const stepTitle =
                order.status === 'AWAITING_CLIENT_PAYMENT' && step === 'COMPLETED'
                  ? 'Final payment'
                  : clientStepLabel[step]
              const stepDesc =
                order.status === 'AWAITING_CLIENT_PAYMENT' && step === 'COMPLETED'
                  ? 'Pay balance to unlock final downloads'
                  : clientStepDesc[step]
              const icon =
                done
                  ? order.status === 'AWAITING_CLIENT_PAYMENT' && step === 'COMPLETED' && active
                    ? '💳'
                    : clientStepIcon[step]
                  : i + 1
              return (
                <div key={step} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 transition-all ${active ? 'shadow-[0_0_12px_rgba(0,198,162,.35)]' : ''}`}
                    style={{ background: done ? 'var(--accent)' : 'var(--navy)', borderColor: done ? 'var(--accent)' : 'var(--card-border)', color: done ? 'var(--text-on-accent)' : 'var(--muted)', fontWeight: active ? '900' : '400' }}>
                    {icon}
                  </div>
                  <div className="text-center">
                    <span className={`text-[11px] leading-tight font-semibold block ${active ? '' : ''}`} style={{ color: done ? 'var(--accent)' : 'var(--muted)' }}>
                      {stepTitle}
                    </span>
                    <span className="text-[9px] leading-tight block mt-0.5" style={{ color: 'var(--muted)' }}>
                      {stepDesc}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {order.status === 'NEEDS_CLARIFICATION' && order.adminNotes && (
          <div className="mt-5 p-4 rounded-xl border-l-4 text-sm" style={{ background: 'rgba(240,165,0,.08)', borderColor: '#f0a500', color: 'var(--text)' }}>
            <strong style={{ color: '#f0a500' }}>⚠ Clarification Needed:</strong> {order.adminNotes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: details + deliverables + brief */}
        <div className="lg:col-span-2 space-y-5">
          {order.deliverables.length > 0 && ['COMPLETED', 'DELIVERED', 'AWAITING_CLIENT_PAYMENT'].includes(order.status) && (
            <div
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--card-bg)',
                borderColor: order.status === 'AWAITING_CLIENT_PAYMENT' ? 'rgba(240,165,0,.35)' : 'rgba(0,198,162,.25)',
              }}
            >
              <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span>{order.status === 'AWAITING_CLIENT_PAYMENT' ? '👁' : '📦'}</span>
                {order.status === 'AWAITING_CLIENT_PAYMENT' ? 'Deliverables — preview' : 'Deliverables Ready'}
              </h2>
              {order.status === 'AWAITING_CLIENT_PAYMENT' && (
                <div className="mb-4 p-3 rounded-xl text-xs space-y-2" style={{ background: 'rgba(240,165,0,.08)', color: 'var(--text)' }}>
                  <p>
                    <strong>Installment balance:</strong> review the watermarked preview below on this page. Final clean files and email copies are released automatically when your remaining installment invoice(s) for this project are paid in full.
                  </p>
                  {!order.projectId && (
                    <p style={{ color: '#e24b4a' }}>This order is not linked to a project, so payment gating could not be applied. Contact support if this looks wrong.</p>
                  )}
                  {user.role === 'CLIENT' && unpaidInvoices.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="font-semibold" style={{ color: 'var(--muted)' }}>Pay now</p>
                      {unpaidInvoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-mono text-[11px]" style={{ color: 'var(--accent)' }}>{inv.number}</span>
                          {(inv.status === 'SENT' || inv.status === 'OVERDUE') && <PayNowButton invoiceId={inv.id} />}
                        </div>
                      ))}
                    </div>
                  )}
                  {user.role === 'CLIENT' && order.client.allowWatermarkedDeliverableDownload && (
                    <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                      Your account is authorised to download <strong>watermarked preview</strong> copies (optional). Recommended: review on this page only.
                    </p>
                  )}
                </div>
              )}
              {order.status === 'AWAITING_CLIENT_PAYMENT' ? (
                <>
                  <DeliverablePreviewPanel deliverables={order.deliverables} />
                  {user.role === 'CLIENT' && order.client.allowWatermarkedDeliverableDownload && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Optional downloads (watermarked)</p>
                      {order.deliverables.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,.03)' }}>
                          <span className="text-sm">📄 {d.name}</span>
                          <WatermarkedDownloadButton deliverableId={d.id} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  {order.deliverables.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: 'var(--card-border)', background: 'rgba(0,198,162,.04)' }}>
                      <div>
                        <p className="text-sm font-medium">📄 {d.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{(d.size / 1024).toFixed(0)}KB · Uploaded {formatDate(d.createdAt)} {d.sentToEmail ? '· ✉ Emailed' : ''}</p>
                      </div>
                      <DownloadButton deliverableId={d.id} filename={d.name} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Brief files */}
          {order.briefFiles.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <h2 className="font-semibold text-sm mb-4">📎 Your Brief Files</h2>
              <div className="space-y-1.5">
                {order.briefFiles.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,.03)' }}>
                    <span>📄 {f.name}</span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{(f.size/1024).toFixed(0)}KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h2 className="font-semibold text-sm mb-4">Order Details</h2>
            <div className="space-y-3 text-sm">
              <div><span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Description</span><p className="mt-1 leading-relaxed">{order.description}</p></div>
              {order.notes && <div><span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Additional Notes</span><p className="mt-1">{order.notes}</p></div>}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div><span className="text-xs" style={{ color: 'var(--muted)' }}>Service</span><p className="font-medium mt-0.5">{order.service.replace('_',' ')}</p></div>
                <div><span className="text-xs" style={{ color: 'var(--muted)' }}>Priority</span><p className="font-medium mt-0.5 capitalize">{order.priority}</p></div>
                <div><span className="text-xs" style={{ color: 'var(--muted)' }}>Delivery</span><p className="font-medium mt-0.5">{order.deliveryMethod}</p></div>
                {order.deadline && <div><span className="text-xs" style={{ color: 'var(--muted)' }}>Deadline</span><p className="font-medium mt-0.5">{formatDate(order.deadline)}</p></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Right: timeline + messages */}
        <div className="space-y-5">
          {/* Timeline */}
          <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <h2 className="font-semibold text-sm mb-4">Timeline</h2>
            <div className="space-y-3">
              {order.timeline.map((t, i) => (
                <div key={t.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--accent)' }}/>
                    {i < order.timeline.length-1 && <div className="w-[1px] flex-1 min-h-[16px]" style={{ background: 'var(--card-border)' }}/>}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold">{timelineLabel[t.status] || t.status.replace('_', ' ')}</p>
                    {t.note && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{t.note}</p>}
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{formatDate(t.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Messages */}
          <OrderMessages orderId={order.id} initialMessages={order.messages as any} userRole="CLIENT" currentUserId={user.id}/>
        </div>
      </div>
    </div>
  )
}
