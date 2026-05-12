import type { User, Project, Invoice, Quote, Assignment, Activity } from '@prisma/client'

export type { User, Project, Invoice, Quote, Assignment, Activity }

export type UserWithRole = User & { role: 'ADMIN' | 'CLIENT' | 'RESEARCHER' | 'FINANCE' }

export type ProjectWithClient = Project & { client: User; invoices: Invoice[]; assignments: (Assignment & { user: User })[] }

export type InvoiceWithRelations = Invoice & { project: Project; client: User; payments: any[] }

export type DashboardStats = {
  totalProjects: number; activeProjects: number; totalRevenue: number; pendingPayments: number
}
