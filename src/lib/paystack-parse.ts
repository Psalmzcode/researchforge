/** Paystack sometimes returns metadata as a JSON string. */
export function normalizePaystackMeta(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null
  if (typeof raw === 'string') {
    try {
      const o = JSON.parse(raw)
      return typeof o === 'object' && o !== null ? (o as Record<string, unknown>) : null
    } catch {
      return null
    }
  }
  if (typeof raw === 'object') return raw as Record<string, unknown>
  return null
}

export function metaInvoiceIdFromPaystack(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null
  const raw = meta.invoiceId ?? meta.invoice_id
  if (typeof raw === 'string' && raw.length > 0) return raw
  if (typeof raw === 'number') return String(raw)
  return null
}

/** Init reference format: SW-{invoiceNumber}-{timestamp} → INV-545715 */
export function invoiceNumberFromSwReference(txRef: string): string | null {
  if (!txRef.startsWith('SW-')) return null
  const rest = txRef.slice(3)
  const m = rest.match(/^(.+)-(\d{10,})$/)
  return m ? m[1] : null
}
