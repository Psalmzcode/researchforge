export type ProjectPayoutPreview = {
  effectiveResearcherShare: number
  effectiveWebsiteOpsShare: number
  collectedRevenue: number
  researcherPool: number
  websiteOpsPool: number
  completedResearcherCount: number
  perResearcherIfSplitEvenly: number
  payoutEligible: boolean
}

/**
 * Researcher pool = % of **collected** revenue (paid invoices). Website/ops pool = % of **what remains**
 * after that researcher slice (not % of gross).
 * Researcher pool is split evenly across researchers who have a **completed** assignment on the project.
 */
export function computeProjectPayoutPreview(input: {
  collectedRevenue: number
  defaultResearcherShare: number
  defaultWebsiteOpsShare: number
  projectResearcherShare: number | null
  projectWebsiteOpsShare: number | null
  completedResearcherCount: number
  projectIsComplete: boolean
}): ProjectPayoutPreview {
  const effectiveResearcherShare = input.projectResearcherShare ?? input.defaultResearcherShare
  const effectiveWebsiteOpsShare = input.projectWebsiteOpsShare ?? input.defaultWebsiteOpsShare
  const collectedRevenue = Math.max(0, input.collectedRevenue)
  const researcherPool = collectedRevenue * (effectiveResearcherShare / 100)
  const remainderAfterResearcher = Math.max(0, collectedRevenue - researcherPool)
  const websiteOpsPool = remainderAfterResearcher * (effectiveWebsiteOpsShare / 100)
  const n = input.completedResearcherCount
  const perResearcherIfSplitEvenly = n > 0 ? researcherPool / n : researcherPool
  const payoutEligible = input.projectIsComplete && collectedRevenue > 0
  return {
    effectiveResearcherShare,
    effectiveWebsiteOpsShare,
    collectedRevenue,
    researcherPool,
    websiteOpsPool,
    completedResearcherCount: n,
    perResearcherIfSplitEvenly,
    payoutEligible,
  }
}

/** Static example: ₦1M collected, 40% researchers, 15% of *remainder* to website/ops, 2 researchers. */
export const PROJECT_PAYOUT_SAMPLE = {
  collected: 1_000_000,
  researcherShare: 40,
  websiteOpsShare: 15,
  completedResearchers: 2,
} as const

export function describeProjectPayoutSample(formatCurrency: (n: number) => string) {
  const { collected, researcherShare, websiteOpsShare, completedResearchers } = PROJECT_PAYOUT_SAMPLE
  const researcherPool = collected * (researcherShare / 100)
  const afterResearcher = collected - researcherPool
  const websitePool = afterResearcher * (websiteOpsShare / 100)
  const each = researcherPool / completedResearchers
  const remainder = collected - researcherPool - websitePool
  return {
    line1: `Collected (paid invoices): ${formatCurrency(collected)}`,
    line2: `Researcher share ${researcherShare}% of collected → ${formatCurrency(researcherPool)} total → ${formatCurrency(each)} each if ${completedResearchers} researchers completed work on this project.`,
    line3: `Website / ops ${websiteOpsShare}% of the remainder after researchers (${formatCurrency(afterResearcher)}) → ${formatCurrency(websitePool)}.`,
    line4: `Rough remainder for the business after both: about ${formatCurrency(remainder)} (before other costs).`,
  }
}
