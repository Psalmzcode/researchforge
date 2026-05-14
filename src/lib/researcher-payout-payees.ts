export type ResearcherPayeeRow = {
  assignmentId: string
  name: string
  email: string
  completed: boolean
  suggested: number
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
}

export function buildResearcherPayeeRows(
  assignments: Array<{
    id: string
    completedAt: Date | null
    user: {
      name: string | null
      email: string
      payoutBankName?: string | null
      payoutAccountNumber?: string | null
      payoutAccountHolder?: string | null
    }
  }>,
  perResearcherIfSplitEvenly: number,
): ResearcherPayeeRow[] {
  return assignments.map((a) => ({
    assignmentId: a.id,
    name: a.user.name ?? '',
    email: a.user.email,
    completed: a.completedAt != null,
    suggested: a.completedAt != null ? perResearcherIfSplitEvenly : 0,
    bankName: a.user.payoutBankName ?? null,
    accountNumber: a.user.payoutAccountNumber ?? null,
    accountHolder: a.user.payoutAccountHolder ?? null,
  }))
}
