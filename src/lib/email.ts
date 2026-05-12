// Email via Resend — swap RESEND_API_KEY in .env
const RESEND_KEY = process.env.RESEND_API_KEY!
const FROM = process.env.FROM_EMAIL || 'noreply@researchforge.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024 // 20MB combined limit (safe margin under Resend's 25MB)

interface FileRef {
  name: string
  url: string
  size?: number
}

interface Attachment {
  filename: string
  content: string // base64
}

/** Fetch a remote file and return a base64 attachment object. Returns null if the file is too large or fetch fails. */
async function fetchAttachment(file: FileRef, remainingBytes: number): Promise<{ attachment: Attachment; bytes: number } | null> {
  try {
    if (file.size && file.size > remainingBytes) return null
    const res = await fetch(file.url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength > remainingBytes) return null
    return { attachment: { filename: file.name, content: buf.toString('base64') }, bytes: buf.byteLength }
  } catch {
    return null
  }
}

/** Build attachments from a list of files, respecting the size budget. Returns attached files + any that were too large (linked instead). */
async function buildAttachments(files: FileRef[]): Promise<{ attachments: Attachment[]; linked: FileRef[] }> {
  const attachments: Attachment[] = []
  const linked: FileRef[] = []
  let budget = MAX_ATTACHMENT_BYTES

  for (const file of files) {
    const result = await fetchAttachment(file, budget)
    if (result) {
      attachments.push(result.attachment)
      budget -= result.bytes
    } else {
      linked.push(file)
    }
  }
  return { attachments, linked }
}

function fileLinksHtml(files: FileRef[], label: string): string {
  if (files.length === 0) return ''
  const items = files.map(f => `<li><a href="${f.url}" style="color:#00c6a2">${f.name}</a></li>`).join('')
  return `<p style="margin-top:16px;font-size:13px;color:#888">${label}</p><ul style="padding-left:20px">${items}</ul>`
}

async function send(to: string | string[], subject: string, html: string, attachments?: Attachment[]) {
  if (!RESEND_KEY || RESEND_KEY.startsWith('re_test')) {
    const recipients = Array.isArray(to) ? to.join(', ') : to
    console.log(`[EMAIL MOCK] To: ${recipients} | Subject: ${subject} | Attachments: ${attachments?.length ?? 0}`)
    return { ok: true }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `ResearchForge <${FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    }),
  })
  return res.json()
}

// ---------------------------------------------------------------------------
// 1. Client → Admin: order submitted (brief files attached)
// ---------------------------------------------------------------------------
export async function sendOrderConfirmation(to: string, name: string, orderNumber: string) {
  return send(to, `Order Received — ${orderNumber}`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Hi ${name},</p>
      <p>We've received your order <strong>${orderNumber}</strong>. Our team will review it and get back to you within 24 hours.</p>
      <a href="${APP_URL}/dashboard/client/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">Track Your Order →</a>
      <p style="color:#888;margin-top:24px;font-size:13px">ResearchForge — Data-Driven Research & Strategy</p>
    </div>
  `)
}

export async function sendNewOrderToAdmins(adminEmails: string[], orderNumber: string, title: string, clientName: string, briefFiles: FileRef[]) {
  const { attachments, linked } = await buildAttachments(briefFiles)
  const attachedNote = attachments.length > 0
    ? `<p style="margin-top:12px;font-size:13px">📎 <strong>${attachments.length} brief file(s) attached</strong> to this email.</p>`
    : ''
  const linkedNote = fileLinksHtml(linked, 'These files were too large to attach — download below:')

  return send(adminEmails, `New Order: ${orderNumber} — ${title}`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>A new order has been submitted.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0;color:#888;font-size:13px">Order</td><td style="padding:6px 0;font-weight:bold">${orderNumber}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:13px">Title</td><td style="padding:6px 0">${title}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:13px">Client</td><td style="padding:6px 0">${clientName}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-size:13px">Brief Files</td><td style="padding:6px 0">${briefFiles.length} file(s)</td></tr>
      </table>
      ${attachedNote}
      ${linkedNote}
      <a href="${APP_URL}/dashboard/admin/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">Review Order →</a>
    </div>
  `, attachments)
}

// ---------------------------------------------------------------------------
// 2. Admin → Researcher: order assigned (brief files attached)
// ---------------------------------------------------------------------------
export async function sendAssignmentEmail(to: string, researcherName: string, orderNumber: string, title: string, description: string, briefFiles: FileRef[]) {
  const { attachments, linked } = await buildAttachments(briefFiles)
  const attachedNote = attachments.length > 0
    ? `<p style="margin-top:12px;font-size:13px">📎 <strong>${attachments.length} brief file(s) attached</strong> to this email.</p>`
    : ''
  const linkedNote = fileLinksHtml(linked, 'These files were too large to attach — download below:')

  return send(to, `You've Been Assigned: ${orderNumber} — ${title}`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Hi ${researcherName},</p>
      <p>You have been assigned to order <strong>${orderNumber}</strong>.</p>
      <div style="padding:16px;background:#f0f4f8;border-radius:12px;margin:16px 0">
        <p style="font-weight:bold;margin-bottom:8px">${title}</p>
        <p style="font-size:13px;color:#333;line-height:1.6">${description.slice(0, 500)}${description.length > 500 ? '…' : ''}</p>
      </div>
      ${attachedNote}
      ${linkedNote}
      <a href="${APP_URL}/dashboard/researcher/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">View Assignment →</a>
    </div>
  `, attachments)
}

// ---------------------------------------------------------------------------
// 3. Researcher → Admin: deliverables uploaded (files attached)
// ---------------------------------------------------------------------------
export async function sendDeliverablesForReview(adminEmails: string[], orderNumber: string, researcherName: string, deliverables: FileRef[]) {
  const { attachments, linked } = await buildAttachments(deliverables)
  const attachedNote = attachments.length > 0
    ? `<p style="margin-top:12px;font-size:13px">📎 <strong>${attachments.length} deliverable(s) attached</strong> to this email for review.</p>`
    : ''
  const linkedNote = fileLinksHtml(linked, 'These files were too large to attach — download below:')

  return send(adminEmails, `Deliverables Ready for Review — ${orderNumber}`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Researcher <strong>${researcherName}</strong> has uploaded deliverables for <strong>${orderNumber}</strong>.</p>
      <p>Please review the files and approve to notify the client.</p>
      ${attachedNote}
      ${linkedNote}
      <a href="${APP_URL}/dashboard/admin/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">Review & Approve →</a>
    </div>
  `, attachments)
}

/** Installment preview: no file links — client reviews on dashboard until final payment. */
export async function sendDeliverablePreviewHoldEmail(
  to: string,
  name: string,
  orderNumber: string,
  orderUrl: string,
) {
  return send(
    to,
    `Preview ready — complete payment for ${orderNumber}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Hi ${name},</p>
      <p>Your deliverables for order <strong>${orderNumber}</strong> have passed our quality review.</p>
      <p>Because this project is on an <strong>installment plan</strong> with a remaining balance, you can <strong>review a watermarked preview on your dashboard</strong> (recommended). Final clean files and email copies are released automatically once your remaining invoice is paid in full.</p>
      <p style="font-size:13px;color:#666">If your account has been authorised for watermarked downloads, you will also see a download option for preview copies only.</p>
      <a href="${orderUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">Open order &amp; preview →</a>
    </div>
  `,
  )
}

// ---------------------------------------------------------------------------
// 4. Admin → Client: work approved (deliverables attached)
// ---------------------------------------------------------------------------
export async function sendDeliverableEmail(to: string, name: string, orderNumber: string, deliverables: FileRef[]) {
  const { attachments, linked } = await buildAttachments(deliverables)
  const allFiles = [...deliverables]
  const linksList = allFiles.map(d => `<li><a href="${d.url}" style="color:#00c6a2">${d.name}</a></li>`).join('')
  const attachedNote = attachments.length > 0
    ? `<p style="margin-top:12px;font-size:13px">📎 <strong>${attachments.length} file(s) attached</strong> to this email.</p>`
    : ''
  const linkedNote = fileLinksHtml(linked, 'Some files were too large to attach — download here:')

  return send(to, `Your Deliverables Are Ready — ${orderNumber}`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Hi ${name},</p>
      <p>Your deliverables for order <strong>${orderNumber}</strong> are ready.</p>
      ${attachedNote}
      <p style="margin-top:12px">You can also download all files from your dashboard or use the links below:</p>
      <ul style="margin:12px 0;padding-left:20px">${linksList}</ul>
      ${linkedNote}
      <a href="${APP_URL}/dashboard/client/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">Open Dashboard →</a>
    </div>
  `, attachments)
}

// ---------------------------------------------------------------------------
// Status updates & invoices (unchanged)
// ---------------------------------------------------------------------------
export async function sendStatusUpdate(to: string, name: string, orderNumber: string, status: string, note?: string) {
  const statusLabel: Record<string,string> = {
    REVIEWING:'Under Review',IN_PROGRESS:'In Progress',NEEDS_CLARIFICATION:'Needs Clarification',
    PENDING_REVIEW:'Under Review',AWAITING_CLIENT_PAYMENT:'Preview ready — payment due',COMPLETED:'Work Completed',DELIVERED:'Delivered',CANCELLED:'Cancelled'
  }
  return send(to, `Order ${orderNumber} — ${statusLabel[status]||status}`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Hi ${name},</p>
      <p>Your order <strong>${orderNumber}</strong> has been updated to: <strong>${statusLabel[status]||status}</strong></p>
      ${note ? `<p style="padding:12px;background:#f0f4f8;border-radius:8px;color:#333">${note}</p>` : ''}
      <a href="${APP_URL}/dashboard/client/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">View Order →</a>
    </div>
  `)
}

export async function sendInvoiceEmail(to: string, name: string, invoiceNumber: string, amount: number, payLink: string) {
  return send(to, `Invoice ${invoiceNumber} — Payment Due`, `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#00c6a2">ResearchForge Consulting</h2>
      <p>Hi ${name},</p>
      <p>Invoice <strong>${invoiceNumber}</strong> for <strong>₦${amount.toLocaleString()}</strong> is ready for payment.</p>
      <a href="${payLink}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#00c6a2;color:#0a1628;border-radius:50px;font-weight:bold;text-decoration:none">Pay Now →</a>
    </div>
  `)
}
