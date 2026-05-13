const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/** Shared HTML shell for transactional emails (table-based for clients). */
export function emailShell(opts: { title: string; preheader?: string; innerHtml: string }): string {
  const pre = opts.preheader
    ? `<div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(opts.preheader)}</div>`
    : ''
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;background:#0a1628;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#e8ecf4;">
${pre}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a1628;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#111b2e;border-radius:16px;border:1px solid rgba(0,198,162,.2);overflow:hidden;">
        <tr><td style="padding:28px 28px 8px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#fff;">Research<span style="color:#00c6a2">Forge</span></div>
        </td></tr>
        <tr><td style="padding:8px 28px 28px;">
          ${opts.innerHtml}
        </td></tr>
        <tr><td style="padding:16px 28px;background:rgba(0,0,0,.2);font-size:11px;color:#8892a4;text-align:center;border-top:1px solid rgba(255,255,255,.06);">
          ${APP_URL.replace(/^https?:\/\//, '')} · This message was sent by ResearchForge
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buttonHtml(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-top:20px;padding:14px 28px;background:#00c6a2;color:#0a1628;border-radius:999px;font-weight:700;text-decoration:none;font-size:14px;">${escapeHtml(label)}</a>`
}

/** Plain paragraph body copy (HTML-escaped). */
export function emailP(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#b8c0d4;">${escapeHtml(text)}</p>`
}

/** Muted note / admin message box. */
export function emailNoteBox(htmlInner: string): string {
  return `<div style="padding:14px 16px;background:rgba(255,255,255,.06);border-radius:12px;border:1px solid rgba(255,255,255,.08);margin:16px 0;font-size:14px;line-height:1.55;color:#e8ecf4;">${htmlInner}</div>`
}

/** Key–value rows for order / assignment summaries. */
export function emailKeyValueTable(rows: { label: string; value: string }[]): string {
  const tr = rows
    .map(
      ({ label, value }) => `
    <tr>
      <td style="padding:8px 12px 8px 0;color:#8892a4;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;font-size:14px;color:#e8ecf4;">${escapeHtml(value)}</td>
    </tr>`
    )
    .join('')
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;border-collapse:collapse;">${tr}</table>`
}

/** Title line inside the shell (below logo). */
export function emailH1(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:20px;color:#fff;">${escapeHtml(text)}</h1>`
}
