import { db } from '@/lib/db'

const GLOBAL_ID = 'global'

export type AppSettingsRow = {
  id: string
  defaultResearcherSharePercent: number
  defaultWebsiteOpsSharePercent: number
  websitePayoutBankName?: string | null
  websitePayoutAccountNumber?: string | null
  websitePayoutAccountHolder?: string | null
}

export async function ensureAppSettings(): Promise<AppSettingsRow> {
  const s = (db as any).appSettings
  let row = await s.findUnique({ where: { id: GLOBAL_ID } })
  if (!row) {
    row = await s.create({
      data: {
        id: GLOBAL_ID,
        defaultResearcherSharePercent: 40,
        defaultWebsiteOpsSharePercent: 15,
      },
    })
  }
  return row as AppSettingsRow
}

export async function getDefaultResearcherSharePercent(): Promise<number> {
  const row = await ensureAppSettings()
  return row.defaultResearcherSharePercent
}

export async function getDefaultWebsiteOpsSharePercent(): Promise<number> {
  const row = await ensureAppSettings()
  return row.defaultWebsiteOpsSharePercent ?? 15
}
