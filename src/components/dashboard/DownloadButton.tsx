'use client'
import { useState } from 'react'
export function DownloadButton({ deliverableId, filename }: { deliverableId: string; filename: string }) {
  const [loading, setLoading] = useState(false)
  async function download() {
    setLoading(true)
    window.location.href = `/api/deliverables/${deliverableId}/download`
    setTimeout(() => setLoading(false), 2000)
  }
  return (
    <button onClick={download} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-60"
      style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
      {loading ? '…' : '⬇ Download'}
    </button>
  )
}
