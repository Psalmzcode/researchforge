/**
 * Static HTML previews for transactional emails (admin UI).
 * Keep content aligned with `src/lib/email.ts` send* functions.
 */
import {
  buttonHtml,
  emailH1,
  emailKeyValueTable,
  emailNoteBox,
  emailP,
  emailShell,
  escapeHtml,
} from '@/lib/email-layout'

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export type EmailPreviewItem = {
  id: string
  title: string
  audience: string
  subject: string
  html: string
}

function shell(title: string, preheader: string, inner: string) {
  return emailShell({ title, preheader, innerHtml: inner })
}

/** Sample data — previews only; not sent. */
export function getEmailPreviews(): EmailPreviewItem[] {
  const clientName = 'Aisha Musa'
  const researcherName = 'Tunde Adeyemi'
  const orderNumber = 'ORD-000042'
  const orderTitle = 'Household Survey — Kano State'
  const briefExcerpt =
    'Objective: Understand household income patterns and access to clean water. Target: 400 households across two zones. Methodology: structured interviews using ODK…'
  const invoiceNo = 'INV-0041'
  const amount = 900_000

  const sampleDeliverables = [
    { name: 'Final_Report.pdf', url: `${APP}/dashboard/client/orders` },
    { name: 'Data_tables.xlsx', url: `${APP}/dashboard/client/orders` },
  ]
  const linksList = sampleDeliverables
    .map(
      d =>
        `<li style="margin:6px 0;"><a href="${escapeHtml(d.url)}" style="color:#00c6a2;">${escapeHtml(d.name)}</a></li>`
    )
    .join('')

  return [
    {
      id: 'signup-otp',
      title: 'Client sign-up verification (OTP)',
      audience: 'Client (public sign-up)',
      subject: 'Your ResearchForge verification code',
      html: shell(
        'Verify your email',
        'Your ResearchForge code is 000000',
        `
    ${emailH1('Verify your email')}
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b8c0d4;">Use this code to finish creating your ResearchForge client account. If you didn&apos;t sign up, you can ignore this email.</p>
    <div style="text-align:center;padding:24px 16px;background:rgba(0,198,162,.08);border-radius:12px;border:1px dashed rgba(0,198,162,.35);">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;color:#00c6a2;text-transform:uppercase;margin-bottom:8px;">One-time code</div>
      <div style="font-size:34px;font-weight:800;letter-spacing:0.35em;color:#fff;font-family:ui-monospace,monospace;">000000</div>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#8892a4;">This code expires in <strong style="color:#e8ecf4;">15 minutes</strong>.</p>
  `
      ),
    },
    {
      id: 'staff-invite',
      title: 'Staff / researcher invitation',
      audience: 'Researcher, Finance, or Admin (invite link)',
      subject: "You're invited — ResearchForge (Researcher)",
      html: shell(
        'Team invitation',
        'Join ResearchForge as Researcher',
        `
    ${emailH1("You're invited to ResearchForge")}
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b8c0d4;">Hi ${escapeHtml(researcherName)},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#b8c0d4;">You&apos;ve been invited to join as <strong style="color:#00c6a2;">Researcher</strong>. Click the button below to choose a password and activate your account.</p>
    <div style="text-align:center;">${buttonHtml(`${APP}/invite/accept?t=…`, 'Accept invitation')}</div>
    <p style="margin:24px 0 0;font-size:13px;color:#8892a4;">This link expires in <strong style="color:#e8ecf4;">48 hours</strong> and can only be used once.</p>
  `
      ),
    },
    {
      id: 'order-confirmation',
      title: 'Order received (client)',
      audience: 'Client',
      subject: `Order received — ${orderNumber}`,
      html: shell('Order received', `Order ${orderNumber} received`, `
    ${emailH1('Order received')}
    ${emailP(`Hi ${clientName},`)}
    ${emailP(`We've received your order ${orderNumber}. Our team will review it and get back to you within 24 hours.`)}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/client/orders`, 'Track your order')}</div>
  `),
    },
    {
      id: 'new-order-admins',
      title: 'New order (admins)',
      audience: 'Admin',
      subject: `New order: ${orderNumber} — ${orderTitle}`,
      html: shell('New order', orderTitle, `
    ${emailH1('New order submitted')}
    ${emailP('A client has submitted a new order.')}
    ${emailKeyValueTable([
      { label: 'Order', value: orderNumber },
      { label: 'Title', value: orderTitle },
      { label: 'Client', value: 'UNICEF NG' },
      { label: 'Brief files', value: '2 file(s)' },
    ])}
    ${emailP('📎 Brief files may be attached in the real email when sizes allow.')}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/admin/orders`, 'Review order')}</div>
  `),
    },
    {
      id: 'assignment',
      title: 'Order assigned (researcher)',
      audience: 'Researcher',
      subject: `You've been assigned: ${orderNumber} — ${orderTitle}`,
      html: shell('Assignment', orderTitle, `
    ${emailH1('New assignment')}
    ${emailP(`Hi ${researcherName},`)}
    ${emailP(`You have been assigned to order ${orderNumber}.`)}
    <div style="padding:16px;background:rgba(255,255,255,.06);border-radius:12px;border:1px solid rgba(255,255,255,.08);margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:700;color:#fff;font-size:15px;">${escapeHtml(orderTitle)}</p>
      <p style="margin:0;font-size:13px;color:#b8c0d4;line-height:1.6;">${escapeHtml(briefExcerpt)}</p>
    </div>
    ${emailP('📎 Brief files may be attached in the real email when sizes allow.')}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/researcher/orders`, 'View assignment')}</div>
  `),
    },
    {
      id: 'deliverables-review',
      title: 'Deliverables for admin review',
      audience: 'Admin',
      subject: `Deliverables ready for review — ${orderNumber}`,
      html: shell('Deliverables', `Order ${orderNumber}`, `
    ${emailH1('Deliverables ready for review')}
    ${emailP(`${researcherName} has uploaded deliverables for ${orderNumber}.`)}
    ${emailP('Please review the files and approve to notify the client.')}
    ${emailP('📎 Files may be attached in the real email when sizes allow.')}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/admin/orders`, 'Review & approve')}</div>
  `),
    },
    {
      id: 'preview-hold',
      title: 'Installment preview (client)',
      audience: 'Client',
      subject: `Preview ready — complete payment for ${orderNumber}`,
      html: shell('Preview ready', orderNumber, `
    ${emailH1('Preview ready')}
    ${emailP(`Hi ${clientName},`)}
    ${emailP(`Your deliverables for order ${orderNumber} have passed our quality review.`)}
    ${emailP(
      'Because this project is on an installment plan with a remaining balance, you can review a watermarked preview on your dashboard. Final clean files are released once your remaining invoice is paid in full.'
    )}
    ${emailP('If your account has been authorised for watermarked downloads, you will also see a download option for preview copies only.')}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/client/orders`, 'Open order & preview')}</div>
  `),
    },
    {
      id: 'deliverables-client',
      title: 'Deliverables ready (client)',
      audience: 'Client',
      subject: `Your deliverables are ready — ${orderNumber}`,
      html: shell('Deliverables', orderNumber, `
    ${emailH1('Your deliverables are ready')}
    ${emailP(`Hi ${clientName},`)}
    ${emailP(`Your deliverables for order ${orderNumber} are ready.`)}
    ${emailP('📎 Final files may be attached in the real email when sizes allow.')}
    ${emailP('You can also download all files from your dashboard or use the links below:')}
    <ul style="margin:12px 0;padding-left:20px;color:#e8ecf4;">${linksList}</ul>
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/client/orders`, 'Open dashboard')}</div>
  `),
    },
    {
      id: 'status-update',
      title: 'Order status update (client)',
      audience: 'Client',
      subject: `Order ${orderNumber} — In progress`,
      html: shell('Order update', 'In progress', `
    ${emailH1('Order update')}
    ${emailP(`Hi ${clientName},`)}
    ${emailP(`Your order ${orderNumber} has been updated to: In progress`)}
    ${emailNoteBox('Field team has completed 40% of enumerations in Zone A.')}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/client/orders`, 'View order')}</div>
  `),
    },
    {
      id: 'invoice',
      title: 'Invoice / payment (client)',
      audience: 'Client',
      subject: `Invoice ${invoiceNo} — payment due`,
      html: shell('Invoice', invoiceNo, `
    ${emailH1('Invoice')}
    ${emailP(`Hi ${clientName},`)}
    ${emailP(`Invoice ${invoiceNo} for ₦${amount.toLocaleString()} is ready for payment.`)}
    <div style="text-align:center;">${buttonHtml(`${APP}/dashboard/client/invoices`, 'Pay now')}</div>
  `),
    },
  ]
}
