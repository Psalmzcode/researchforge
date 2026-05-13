'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'

export function ClientWatermarkedToggle({
  clientId,
  initial,
}: {
  clientId: string
  initial: boolean
}) {
  const router = useRouter()
  const [on, setOn] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !on
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/watermarked-download`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowWatermarkedDeliverableDownload: next }),
      })
      if (res.ok) {
        setOn(next)
        router.refresh()
        toast.success(next ? 'Watermarked downloads enabled for this client.' : 'Watermarked downloads disabled.')
      } else {
        toast.error(await getJsonError(res))
      }
    } catch {
      toast.error('Could not update setting.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 text-[.65rem] font-bold px-2 py-1 rounded-full border transition-opacity disabled:opacity-50"
      style={{
        borderColor: on ? 'var(--accent)' : 'var(--card-border)',
        background: on ? 'rgba(0,198,162,.12)' : 'transparent',
        color: on ? 'var(--accent)' : 'var(--muted)',
      }}
      title="Allow this client to download watermarked preview files while final installment is pending. Default is site-only preview."
    >
      {loading ? (
        <>
          <Spinner size="sm" label="Updating" />
          <span>Updating…</span>
        </>
      ) : on ? (
        'WM download: on'
      ) : (
        'WM download: off'
      )}
    </button>
  )
}
