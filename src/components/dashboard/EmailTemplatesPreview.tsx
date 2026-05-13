'use client'
import { useMemo, useState } from 'react'
import type { EmailPreviewItem } from '@/lib/email-previews'

export function EmailTemplatesPreview({ previews }: { previews: EmailPreviewItem[] }) {
  const [id, setId] = useState(previews[0]?.id ?? '')
  const selected = useMemo(() => previews.find(p => p.id === id) ?? previews[0], [previews, id])
  const html = selected?.html ?? ''

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <nav
        className="flex w-full flex-col gap-1 rounded-2xl border p-2 lg:max-w-[280px] lg:flex-shrink-0"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        aria-label="Email templates"
      >
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          Choose template
        </p>
        {previews.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setId(p.id)}
            className="rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
            style={{
              background: p.id === selected?.id ? 'rgba(0,198,162,.12)' : 'transparent',
              color: p.id === selected?.id ? 'var(--accent)' : 'var(--text)',
              border: p.id === selected?.id ? '1px solid rgba(0,198,162,.25)' : '1px solid transparent',
            }}
          >
            <span className="block font-medium leading-snug">{p.title}</span>
            <span className="mt-0.5 block text-[11px] opacity-80" style={{ color: 'var(--muted)' }}>
              {p.audience}
            </span>
          </button>
        ))}
      </nav>
      <div className="min-h-0 min-w-0 flex-1 space-y-3">
        {selected && (
          <>
            <div className="rounded-xl border px-3 py-2 text-xs sm:px-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              <span className="font-semibold" style={{ color: 'var(--muted)' }}>
                Subject line:{' '}
              </span>
              <span className="break-words">{selected.subject}</span>
            </div>
            <div className="overflow-hidden rounded-2xl border shadow-lg" style={{ borderColor: 'var(--card-border)' }}>
              <iframe
                title={`Email preview: ${selected.title}`}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                className="h-[min(78vh,720px)] w-full bg-white"
                srcDoc={html}
              />
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Previews use sample data. Attachments are described in copy when applicable; real sends may include files via
              Resend. HTML matches the branded layout in <code className="text-[10px]">src/lib/email.ts</code> and{' '}
              <code className="text-[10px]">email-layout.ts</code>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
