import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getEmailPreviews } from '@/lib/email-previews'
import { EmailTemplatesPreview } from '@/components/dashboard/EmailTemplatesPreview'

export default async function AdminEmailTemplatesPage() {
  const session = await auth()
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') redirect('/login')

  const previews = getEmailPreviews()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-xl font-bold sm:text-2xl">Email templates</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Read-only previews of messages sent to clients, researchers, and admins (Resend + shared layout).
        </p>
        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
          <strong className="text-[var(--text)]">URL:</strong>{' '}
          <span className="select-all break-all">/dashboard/admin/emails</span>
        </p>
      </div>
      <EmailTemplatesPreview previews={previews} />
    </div>
  )
}
