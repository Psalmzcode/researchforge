import { PrismaClient, Role, ServiceType, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPw = await bcrypt.hash('admin123', 12)
  const clientPw = await bcrypt.hash('client123', 12)
  const researchPw = await bcrypt.hash('research123', 12)
  const financePw = await bcrypt.hash('finance123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@researchforge.com' },
    update: {},
    create: { name: 'Chukwuemeka O.', email: 'admin@researchforge.com', password: adminPw, role: Role.ADMIN, organization: 'ResearchForge' },
  })

  const client = await prisma.user.upsert({
    where: { email: 'aisha@unicef.org' },
    update: {},
    create: { name: 'Aisha Musa', email: 'aisha@unicef.org', password: clientPw, role: Role.CLIENT, organization: 'UNICEF NG' },
  })

  const researcher = await prisma.user.upsert({
    where: { email: 'tunde@researchforge.com' },
    update: {},
    create: { name: 'Tunde Adeyemi', email: 'tunde@researchforge.com', password: researchPw, role: Role.RESEARCHER, organization: 'ResearchForge' },
  })

  const finance = await prisma.user.upsert({
    where: { email: 'ngozi@researchforge.com' },
    update: {},
    create: { name: 'Ngozi Eze', email: 'ngozi@researchforge.com', password: financePw, role: Role.FINANCE, organization: 'ResearchForge' },
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

  await prisma.assignment.upsert({
    where: { id: 'seed-assign-1' },
    update: {},
    create: { id: 'seed-assign-1', projectId: project.id, userId: researcher.id, role: 'lead', task: 'Household survey Zone A', target: '200 responses', progress: 65 },
  })

  await prisma.invoice.upsert({
    where: { number: 'INV-0041' },
    update: {},
    create: { number: 'INV-0041', projectId: project.id, clientId: client.id, amount: 900000, amountPaid: 450000, status: 'SENT', paymentType: 'INSTALLMENT', dueDate: new Date('2025-06-15') },
  })

  console.log('Seed complete. Test accounts:')
  console.log('  admin@researchforge.com / admin123')
  console.log('  aisha@unicef.org / client123')
  console.log('  tunde@researchforge.com / research123')
  console.log('  ngozi@researchforge.com / finance123')
}

main().catch(console.error).finally(() => prisma.$disconnect())

// Add a sample order
async function seedOrder() {
  const client = await prisma.user.findUnique({ where: { email: 'aisha@unicef.org' } })
  const researcher = await prisma.user.findUnique({ where: { email: 'tunde@researchforge.com' } })
  if (!client || !researcher) return

  const existing = await prisma.order.findFirst({ where: { orderNumber: 'ORD-000001' } })
  if (existing) return

  const order = await prisma.order.create({
    data: {
      orderNumber: 'ORD-000001',
      clientId: client.id,
      title: 'Household Survey — Kano State Zone A & B',
      description: 'We need a comprehensive household survey across Zone A and B of Kano State.\n\nObjective: Understand household income patterns, access to clean water, and sanitation infrastructure.\n\nTarget: 400 households total (200 per zone)\nMethodology: In-person structured interviews using ODK\nTimeline: 3 weeks from start date\nExpected output: Final report with data tables, charts, and executive summary',
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

seedOrder().catch(console.error)
