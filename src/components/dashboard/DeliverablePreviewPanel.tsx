'use client'
import { useState } from 'react'

export function DeliverablePreviewPanel({
  deliverables,
}: {
  deliverables: { id: string; name: string; url: string; type: string }[]
}) {
  const [idx, setIdx] = useState(0)
  const d = deliverables[idx]
  const isPdf =
    d.type.toLowerCase().includes('pdf') ||
    d.name.toLowerCase().endsWith('.pdf')

  return (
    <div className="space-y-3">
      {deliverables.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {deliverables.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setIdx(i)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                borderColor: i === idx ? 'var(--accent)' : 'var(--card-border)',
                background: i === idx ? 'rgba(0,198,162,.1)' : 'transparent',
                color: i === idx ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
      <div
        className="relative rounded-xl border overflow-hidden bg-[#0f1419]"
        style={{ borderColor: 'var(--card-border)', minHeight: 'min(70vh, 720px)' }}
        onContextMenu={e => e.preventDefault()}
      >
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center select-none">
          <span
            className="text-2xl sm:text-4xl md:text-5xl font-black tracking-wider opacity-[0.22] rotate-[-26deg] text-white whitespace-nowrap px-4 text-center"
            style={{ textShadow: '0 0 2px rgba(0,0,0,.8)' }}
          >
            PREVIEW — ResearchForge
          </span>
        </div>
        {isPdf ? (
          <iframe title={d.name} src={d.url} className="relative z-0 w-full h-[min(70vh,720px)] border-0 bg-[#1a1a2e]" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={d.url}
            alt=""
            className="relative z-0 w-full max-h-[min(70vh,720px)] object-contain mx-auto block"
            draggable={false}
          />
        )}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        Recommended: review here only. Final clean files unlock automatically after your remaining installment is paid in full.
      </p>
    </div>
  )
}
