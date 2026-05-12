import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')
  const user = session.user as any

  const settings = [
    { label: 'Platform Name', value: 'ResearchForge Consulting', desc: 'Displayed across the app and in emails' },
    { label: 'Admin Email', value: user.email, desc: 'Primary contact for system notifications' },
    { label: 'Default Delivery', value: 'BOTH (Email + Download)', desc: 'Default file delivery method for new orders' },
    { label: 'Max Upload Size', value: '50 MB', desc: 'Maximum file upload size per file' },
    { label: 'Email Provider', value: 'Resend', desc: 'Transactional email service' },
    { label: 'File Storage', value: 'Cloudinary', desc: 'Cloud storage for briefs and deliverables' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl font-bold">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Platform configuration and preferences</p>
      </div>

      <div className="rounded-2xl border divide-y divide-[var(--card-border)]" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {settings.map(s => (
          <div key={s.label} className="flex items-center justify-between px-5 py-4 border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
            <div>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{s.desc}</p>
            </div>
            <span className="text-sm font-mono px-3 py-1 rounded-lg" style={{ background: 'rgba(0,198,162,.08)', color: 'var(--accent)' }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <h2 className="font-semibold text-sm mb-3">Environment</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Node Env', process.env.NODE_ENV || 'development'],
            ['Database', 'PostgreSQL (Neon)'],
            ['Auth', 'NextAuth v5 (JWT)'],
            ['App URL', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
          ].map(([k, v]) => (
            <div key={k} className="text-xs">
              <span style={{ color: 'var(--muted)' }}>{k}: </span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
