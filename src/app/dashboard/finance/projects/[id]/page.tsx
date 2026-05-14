import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ProjectPayoutPanel } from '@/components/dashboard/ProjectPayoutPanel'
import { getProjectCollectedRevenue } from '@/lib/project-collected-revenue'
import { ensureAppSettings, getDefaultResearcherSharePercent, getDefaultWebsiteOpsSharePercent } from '@/lib/app-settings'
import { computeProjectPayoutPreview } from '@/lib/project-payout-math'
import { buildResearcherPayeeRows } from '@/lib/researcher-payout-payees'

export default async function FinanceProjectPayoutPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['FINANCE', 'ADMIN'].includes((session.user as any).role)) redirect('/login')

  const project = await db.project.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, organization: true, email: true } },
      assignments: {
        where: { user: { role: 'RESEARCHER' } },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              payoutBankName: true,
              payoutAccountNumber: true,
              payoutAccountHolder: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!project) notFound()

  const [collected, defaultResearcher, defaultWebsiteOps, appSettings] = await Promise.all([
    getProjectCollectedRevenue(project.id),
    getDefaultResearcherSharePercent(),
    getDefaultWebsiteOpsSharePercent(),
    ensureAppSettings(),
  ])

  const p = project as typeof project & {
    researcherSharePercent?: number | null
    websiteOpsSharePercent?: number | null
    researcherPayoutInitiatedAt?: Date | null
    opsPayoutInitiatedAt?: Date | null
    researcherPayoutTotalRecorded?: number | null
    researcherPayoutPaidAt?: Date | null
    researcherPayoutNote?: string | null
    opsPayoutTotalRecorded?: number | null
    opsPayoutPaidAt?: Date | null
    opsPayoutNote?: string | null
  }

  const completedResearcherCount = project.assignments.filter((a) => a.completedAt != null).length
  const payoutPreview = computeProjectPayoutPreview({
    collectedRevenue: collected,
    defaultResearcherShare: defaultResearcher,
    defaultWebsiteOpsShare: defaultWebsiteOps,
    projectResearcherShare: p.researcherSharePercent ?? null,
    projectWebsiteOpsShare: p.websiteOpsSharePercent ?? null,
    completedResearcherCount,
    projectIsComplete: project.status === 'COMPLETE',
  })
  const researcherPayeeRows = buildResearcherPayeeRows(project.assignments, payoutPreview.perResearcherIfSplitEvenly)
  const websitePayoutRecipient = {
    bankName: appSettings.websitePayoutBankName ?? null,
    accountNumber: appSettings.websitePayoutAccountNumber ?? null,
    accountHolder: appSettings.websitePayoutAccountHolder ?? null,
  }

  const payoutSnapshot = {
    researcherSharePercent: p.researcherSharePercent ?? null,
    websiteOpsSharePercent: p.websiteOpsSharePercent ?? null,
    researcherPayoutInitiatedAt: p.researcherPayoutInitiatedAt ? p.researcherPayoutInitiatedAt.toISOString() : null,
    opsPayoutInitiatedAt: p.opsPayoutInitiatedAt ? p.opsPayoutInitiatedAt.toISOString() : null,
    researcherPayoutTotalRecorded: p.researcherPayoutTotalRecorded ?? null,
    researcherPayoutPaidAt: p.researcherPayoutPaidAt ? p.researcherPayoutPaidAt.toISOString() : null,
    researcherPayoutNote: p.researcherPayoutNote ?? null,
    opsPayoutTotalRecorded: p.opsPayoutTotalRecorded ?? null,
    opsPayoutPaidAt: p.opsPayoutPaidAt ? p.opsPayoutPaidAt.toISOString() : null,
    opsPayoutNote: p.opsPayoutNote ?? null,
  }

  const assignmentRows = project.assignments.map((a) => ({
    id: a.id,
    userId: a.userId,
    completedAt: a.completedAt ? a.completedAt.toISOString() : null,
    user: { name: a.user.name, email: a.user.email },
  }))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/finance/payouts" className="text-xs" style={{ color: 'var(--muted)' }}>
          ← Staff payouts
        </Link>
        <h1 className="font-serif text-2xl font-bold mt-1">{project.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
          <StatusBadge status={project.status} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Client: {project.client.organization || project.client.name}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
            Collected {formatCurrency(collected)}
          </span>
        </div>
        {project.dueDate && (
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            Due {formatDate(project.dueDate)}
          </p>
        )}
      </div>

      <ProjectPayoutPanel
        projectId={project.id}
        projectTitle={project.title}
        projectStatus={project.status}
        collectedRevenue={collected}
        assignments={assignmentRows}
        defaults={{ researcher: defaultResearcher, websiteOps: defaultWebsiteOps }}
        initialSnapshot={payoutSnapshot}
        researcherPayeeRows={researcherPayeeRows}
        websitePayoutRecipient={websitePayoutRecipient}
      />
    </div>
  )
}
