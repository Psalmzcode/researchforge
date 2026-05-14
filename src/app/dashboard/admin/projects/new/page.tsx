import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminNewProjectForm } from '@/components/dashboard/AdminNewProjectForm'

export default async function AdminNewProjectPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')
  return <AdminNewProjectForm />
}
