'use client'
import { useState } from 'react'

export function WatermarkedDownloadButton({ deliverableId }: { deliverableId: string }) {
  const [loading, setLoading] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true)
        window.location.href = `/api/deliverables/${deliverableId}/download-watermarked`
        setTimeout(() => setLoading(false), 2500)
      }}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-60 border"
      style={{ borderColor: 'var(--ghost-outline)', color: 'var(--text)' }}
    >
      {loading ? '…' : '⬇ Preview (watermarked)'}
    </button>
  )
}
