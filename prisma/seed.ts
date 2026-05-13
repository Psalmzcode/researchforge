import { PrismaClient, Role, ServiceType, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPw = await bcrypt.hash('Consultus2026', 12)
  const clientPw = await bcrypt.hash('client123', 12)
  const researchPw = await bcrypt.hash('research123', 12)
  const financePw = await bcrypt.hash('finance123', 12)

  const verified = new Date()

  await prisma.user.deleteMany({ where: { email: 'admin@researchforge.com' } })

  await prisma.user.upsert({
    where: { email: 'researchforgeconsulting@gmail.com' },
    update: {
      password: adminPw,
      emailVerified: verified,
      role: Role.ADMIN,
      organization: 'ResearchForge Consulting',
    },
    create: {
      name: 'ResearchForge Admin',
      email: 'researchforgeconsulting@gmail.com',
      password: adminPw,
      role: Role.ADMIN,
      organization: 'ResearchForge Consulting',
      emailVerified: verified,
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'aisha@unicef.org' },
    update: {
      password: clientPw,
      emailVerified: verified,
      role: Role.CLIENT,
      name: 'Aisha Musa',
      organization: 'UNICEF NG',
    },
    create: {
      name: 'Aisha Musa',
      email: 'aisha@unicef.org',
      password: clientPw,
      role: Role.CLIENT,
      organization: 'UNICEF NG',
      emailVerified: verified,
    },
  })

  const researcher = await prisma.user.upsert({
    where: { email: 'tunde@researchforge.com' },
    update: {
      password: researchPw,
      emailVerified: verified,
      role: Role.RESEARCHER,
      name: 'Tunde Adeyemi',
      organization: 'ResearchForge',
    },
    create: {
      name: 'Tunde Adeyemi',
      email: 'tunde@researchforge.com',
      password: researchPw,
      role: Role.RESEARCHER,
      organization: 'ResearchForge',
      emailVerified: verified,
    },
  })

  const finance = await prisma.user.upsert({
    where: { email: 'ngozi@researchforge.com' },
    update: {
      password: financePw,
      emailVerified: verified,
      role: Role.FINANCE,
      name: 'Ngozi Eze',
      organization: 'ResearchForge',
    },
    create: {
      name: 'Ngozi Eze',
      email: 'ngozi@researchforge.com',
      password: financePw,
      role: Role.FINANCE,
      organization: 'ResearchForge',
      emailVerified: verified,
    },
  })

  const project = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      title: 'Field Survey — Kano',
      description: 'Household survey across Kano State zones A and B',
      service: ServiceType.DIGITAL_SURVEY,
      status: ProjectStatus.ACTIVE,
      dueDate: new Date('2025-06-15'),
      budget: 900000,
      clientId: client.id,
    },
  })

  const seedQuote = await prisma.quote.upsert({
    where: { id: 'seed-quote-1' },
    update: {
      approved: true,
      paymentType: 'INSTALLMENT',
      amount: 900000,
    },
    create: {
      id: 'seed-quote-1',
      projectId: project.id,
      amount: 900000,
      description: 'Seeded quote for local demos',
      approved: true,
      approvedAt: new Date(),
      paymentType: 'INSTALLMENT',
    },
  })

  await prisma.invoice.upsert({
    where: { number: 'INV-0041' },
    update: {
      quoteId: seedQuote.id,
      projectId: project.id,
      clientId: client.id,
      amount: 450000,
      amountPaid: 450000,
      paymentType: 'INSTALLMENT',
      status: 'SENT',
    },
    create: {
      number: 'INV-0041',
      projectId: project.id,
      clientId: client.id,
      quoteId: seedQuote.id,
      amount: 450000,
      amountPaid: 450000,
      status: 'SENT',
      paymentType: 'INSTALLMENT',
      dueDate: new Date('2025-06-15'),
    },
  })

  await prisma.assignment.upsert({
    where: { id: 'seed-assign-1' },
    update: {},
    create: { id: 'seed-assign-1', projectId: project.id, userId: researcher.id, role: 'lead', task: 'Household survey Zone A', target: '200 responses', progress: 65 },
  })

  console.log('Seed complete. Test accounts:')
  console.log('  researchforgeconsulting@gmail.com / Consultus2026')
  console.log('  aisha@unicef.org / client123')
  console.log('  tunde@researchforge.com / research123')
  console.log('  ngozi@researchforge.com / finance123')

  await seedOrder()
}

main().catch(console.error).finally(() => prisma.$disconnect())

async function seedOrder() {
  const client = await prisma.user.findUnique({ where: { email: 'aisha@unicef.org' } })
  const researcher = await prisma.user.findUnique({ where: { email: 'tunde@researchforge.com' } })
  const project = await prisma.project.findUnique({ where: { id: 'seed-project-1' } })
  if (!client || !researcher || !project) return

  const existing = await prisma.order.findFirst({ where: { orderNumber: 'ORD-000001' } })
  if (existing) return

  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-000001',
      clientId: client.id,
      projectId: project.id,
      title: 'Household Survey — Kano State Zone A & B',
      description: 'We need a comprehensive household survey across Zone A and B of Kano State.\n\nObjective: Understand household income patterns, access to clean water, and sanitation infrastructure.\n\nTarget: 400 households total (200 per zone)\nMethodology: In-person structured interviews with digital capture\nTimeline: 3 weeks from start date\nExpected output: Final report with data tables, charts, and executive summary',
      service: 'DIGITAL_SURVEY',
      priority: 'high',
      deliveryMethod: 'BOTH',
      status: 'IN_PROGRESS',
      assignedTo: researcher.id,
      deadline: new Date('2025-06-15'),
      budget: 900000,
      notes: 'Please ensure enumerators are briefed on local dialects. Attach field briefing document with the deliverables.',
    },
  })

  await prisma.orderTimeline.createMany({
    data: [
      { orderId: order.id, status: 'SUBMITTED', note: 'Order submitted by client', createdAt: new Date('2025-05-10') },
      { orderId: order.id, status: 'REVIEWING', note: 'Admin reviewed and accepted', createdAt: new Date('2025-05-11') },
      { orderId: order.id, status: 'IN_PROGRESS', note: 'Assigned to Tunde Adeyemi', createdAt: new Date('2025-05-12') },
    ],
  })

  console.log('Sample order seeded:', order.orderNumber)
}
