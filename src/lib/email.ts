// Email via Resend — set RESEND_API_KEY in .env
import {
  buttonHtml,
  emailH1,
  emailKeyValueTable,
  emailNoteBox,
  emailP,
  emailShell,
  escapeHtml,
} from '@/lib/email-layout'

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
  const items = files
    .map(
      f =>
        `<li style="margin:6px 0;"><a href="${escapeHtml(f.url)}" style="color:#00c6a2;text-decoration:none;">${escapeHtml(f.name)}</a></li>`
    )
    .join('')
  return `<p style="margin-top:16px;font-size:13px;color:#8892a4;">${escapeHtml(label)}</p><ul style="padding-left:20px;margin:8px 0;">${items}</ul>`
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
  const inner = `
    ${emailH1('Order received')}
    ${emailP(`Hi ${name},`)}
    ${emailP(`We've received your order ${orderNumber}. Our team will review it and get back to you within 24 hours.`)}
    <div style="text-align:center;">${buttonHtml(`${APP_URL}/dashboard/client/orders`, 'Track your order')}</div>
  `
  return send(to, `Order received — ${orderNumber}`, emailShell({ title: 'Order received', preheader: `Order ${orderNumber} received`, innerHtml: inner }))
}

export async function sendNewOrderToAdmins(adminEmails: string[], orderNumber: string, title: string, clientName: string, briefFiles: FileRef[]) {
  const { attachments, linked } = await buildAttachments(briefFiles)
  const attachedNote =
    attachments.length > 0
      ? emailP(`📎 ${attachments.length} brief file(s) are attached to this email.`)
      : ''
  const linkedNote = fileLinksHtml(linked, 'These files were too large to attach — download below:')

  const inner = `
    ${emailH1('New order submitted')}
    ${emailP('A client has submitted a new order.')}
    ${emailKeyValueTable([
      { label: 'Order', value: orderNumber },
      { label: 'Title', value: title },
      { label: 'Client', value: clientName },
      { label: 'Brief files', value: `${briefFiles.length} file(s)` },
    ])}
    ${attachedNote}
    ${linkedNote}
    <div style="text-align:center;">${buttonHtml(`${APP_URL}/dashboard/admin/orders`, 'Review order')}</div>
  `
  return send(adminEmails, `New order: ${orderNumber} — ${title}`, emailShell({ title: 'New order', preheader: title, innerHtml: inner }), attachments)
}

// ---------------------------------------------------------------------------
// 2. Admin → Researcher: order assigned (brief files attached)
// ---------------------------------------------------------------------------
export async function sendAssignmentEmail(
  to: string,
  researcherName: string,
  orderNumber: string,
  title: string,
  description: string,
  briefFiles: FileRef[]
) {
  const { attachments, linked } = await buildAttachments(briefFiles)
  const attachedNote =
    attachments.length > 0
      ? emailP(`📎 ${attachments.length} brief file(s) are attached to this email.`)
      : ''
  const linkedNote = fileLinksHtml(linked, 'These files were too large to attach — download below:')
  const excerpt = escapeHtml(description.slice(0, 500)) + (description.length > 500 ? '…' : '')

  const inner = `
    ${emailH1('New assignment')}
    ${emailP(`Hi ${researcherName},`)}
    ${emailP(`You have been assigned to order ${orderNumber}.`)}
    <div style="padding:16px;background:rgba(255,255,255,.06);border-radius:12px;border:1px solid rgba(255,255,255,.08);margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:700;color:#fff;font-size:15px;">${escapeHtml(title)}</p>
      <p style="margin:0;font-size:13px;color:#b8c0d4;line-height:1.6;">${excerpt}</p>
    </div>
    ${attachedNote}
    ${linkedNote}
    <div style="text-align:center;">${buttonHtml(`${APP_URL}/dashboard/researcher/orders`, 'View assignment')}</div>
  `
  return send(to, `You've been assigned: ${orderNumber} — ${title}`, emailShell({ title: 'Assignment', preheader: title, innerHtml: inner }), attachments)
}

// ---------------------------------------------------------------------------
// 3. Researcher → Admin: deliverables uploaded (files attached)
// ---------------------------------------------------------------------------
export async function sendDeliverablesForReview(adminEmails: string[], orderNumber: string, researcherName: string, deliverables: FileRef[]) {
  const { attachments, linked } = await buildAttachments(deliverables)
  const attachedNote =
    attachments.length > 0
      ? emailP(`📎 ${attachments.length} deliverable(s) are attached for review.`)
      : ''
  const linkedNote = fileLinksHtml(linked, 'These files were too large to attach — download below:')

  const inner = `
    ${emailH1('Deliverables ready for review')}
    ${emailP(`${researcherName} has uploaded deliverables for ${orderNumber}.`)}
    ${emailP('Please review the files and approve to notify the client.')}
    ${attachedNote}
    ${linkedNote}
    <div style="text-align:center;">${buttonHtml(`${APP_URL}/dashboard/admin/orders`, 'Review & approve')}</div>
  `
  return send(
    adminEmails,
    `Deliverables ready for review — ${orderNumber}`,
    emailShell({ title: 'Deliverables', preheader: `Order ${orderNumber}`, innerHtml: inner }),
    attachments
  )
}

export async function sendDeliverablePreviewHoldEmail(to: string, name: string, orderNumber: string, orderUrl: string) {
  const inner = `
    ${emailH1('Preview ready')}
    ${emailP(`Hi ${name},`)}
    ${emailP(`Your deliverables for order ${orderNumber} have passed our quality review.`)}
    ${emailP(
      'Because this project is on an installment plan with a remaining balance, you can review a watermarked preview on your dashboard. Final clean files are released once your remaining invoice is paid in full.'
    )}
    ${emailP('If your account has been authorised for watermarked downloads, you will also see a download option for preview copies only.')}
    <div style="text-align:center;">${buttonHtml(orderUrl, 'Open order & preview')}</div>
  `
  return send(
    to,
    `Preview ready — complete payment for ${orderNumber}`,
    emailShell({ title: 'Preview ready', preheader: `Order ${orderNumber}`, innerHtml: inner })
  )
}

// ---------------------------------------------------------------------------
// 4. Admin → Client: work approved (deliverables attached)
// ---------------------------------------------------------------------------
export async function sendDeliverableEmail(to: string, name: string, orderNumber: string, deliverables: FileRef[]) {
  const { attachments, linked } = await buildAttachments(deliverables)
  const allFiles = [...deliverables]
  const linksList = allFiles
    .map(d => `<li style="margin:6px 0;"><a href="${escapeHtml(d.url)}" style="color:#00c6a2;">${escapeHtml(d.name)}</a></li>`)
    .join('')
  const attachedNote =
    attachments.length > 0 ? emailP(`📎 ${attachments.length} file(s) are attached to this email.`) : ''
  const linkedNote = fileLinksHtml(linked, 'Some files were too large to attach — download here:')

  const inner = `
    ${emailH1('Your deliverables are ready')}
    ${emailP(`Hi ${name},`)}
    ${emailP(`Your deliverables for order ${orderNumber} are ready.`)}
    ${attachedNote}
    ${emailP('You can also download all files from your dashboard or use the links below:')}
    <ul style="margin:12px 0;padding-left:20px;color:#e8ecf4;">${linksList}</ul>
    ${linkedNote}
    <div style="text-align:center;">${buttonHtml(`${APP_URL}/dashboard/client/orders`, 'Open dashboard')}</div>
  `
  return send(to, `Your deliverables are ready — ${orderNumber}`, emailShell({ title: 'Deliverables', preheader: orderNumber, innerHtml: inner }), attachments)
}

// ---------------------------------------------------------------------------
// Status updates & invoices
// ---------------------------------------------------------------------------
export async function sendStatusUpdate(to: string, name: string, orderNumber: string, status: string, note?: string) {
  const statusLabel: Record<string, string> = {
    REVIEWING: 'Under review',
    IN_PROGRESS: 'In progress',
    NEEDS_CLARIFICATION: 'Needs clarification',
    PENDING_REVIEW: 'Under review',
    AWAITING_CLIENT_PAYMENT: 'Preview ready — payment due',
    COMPLETED: 'Work completed',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  }
  const label = statusLabel[status] || status
  const noteBlock = note ? emailNoteBox(escapeHtml(note)) : ''

  const inner = `
    ${emailH1('Order update')}
    ${emailP(`Hi ${name},`)}
    ${emailP(`Your order ${orderNumber} has been updated to: ${label}`)}
    ${noteBlock}
    <div style="text-align:center;">${buttonHtml(`${APP_URL}/dashboard/client/orders`, 'View order')}</div>
  `
  return send(to, `Order ${orderNumber} — ${label}`, emailShell({ title: 'Order update', preheader: label, innerHtml: inner }))
}

export async function sendInvoiceEmail(to: string, name: string, invoiceNumber: string, amount: number, payLink: string) {
  const inner = `
    ${emailH1('Invoice')}
    ${emailP(`Hi ${name},`)}
    ${emailP(`Invoice ${invoiceNumber} for ₦${amount.toLocaleString()} is ready for payment.`)}
    <div style="text-align:center;">${buttonHtml(payLink, 'Pay now')}</div>
  `
  return send(to, `Invoice ${invoiceNumber} — payment due`, emailShell({ title: 'Invoice', preheader: invoiceNumber, innerHtml: inner }))
}

export async function sendSignupOtpEmail(to: string, code: string, minutesValid: number) {
  const inner = `
    ${emailH1('Verify your email')}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b8c0d4;">Use this code to finish creating your ResearchForge client account. If you didn&apos;t sign up, you can ignore this email.</p>
    <div style="text-align:center;padding:24px 16px;background:rgba(0,198,162,.08);border-radius:12px;border:1px dashed rgba(0,198,162,.35);">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;color:#00c6a2;text-transform:uppercase;margin-bottom:8px;">One-time code</div>
      <div style="font-size:34px;font-weight:800;letter-spacing:0.35em;color:#fff;font-family:ui-monospace,monospace;">${escapeHtml(code)}</div>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#8892a4;">This code expires in <strong style="color:#e8ecf4;">${minutesValid} minutes</strong>.</p>
  `
  return send(to, 'Your ResearchForge verification code', emailShell({ title: 'Verify your email', preheader: `Your ResearchForge code is ${code}`, innerHtml: inner }))
}

export async function sendStaffInviteEmail(to: string, name: string | null, roleLabel: string, inviteUrl: string, expiresHours: number) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hello,'
  const inner = `
    ${emailH1("You're invited to ResearchForge")}
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b8c0d4;">${greeting}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b8c0d4;">You&apos;ve been invited to join as <strong style="color:#00c6a2;">${escapeHtml(roleLabel)}</strong>. Click the button below to choose a password and activate your account.</p>
    <div style="text-align:center;">${buttonHtml(inviteUrl, 'Accept invitation')}</div>
    <p style="margin:24px 0 0;font-size:13px;color:#8892a4;">This link expires in <strong style="color:#e8ecf4;">${expiresHours} hours</strong> and can only be used once.</p>
  `
  return send(to, `You're invited — ResearchForge (${roleLabel})`, emailShell({ title: 'Team invitation', preheader: `Join ResearchForge as ${roleLabel}`, innerHtml: inner }))
}
