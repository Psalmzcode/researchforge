import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/login')

  const [projects, users, invoices, activities] = await Promise.all([
    db.project.findMany({ include:{client:{select:{name:true,organization:true}},invoices:true}, orderBy:{createdAt:'desc'}, take:8 }),
    db.user.count({ where:{ role:'CLIENT' } }),
    db.invoice.findMany({ orderBy:{createdAt:'desc'}, take:5, include:{client:{select:{name:true,organization:true}},project:{select:{title:true}}} }),
    db.activity.findMany({ orderBy:{createdAt:'desc'}, take:6, include:{project:{select:{title:true}}} }),
  ])

  const activeProjects = projects.filter(p=>p.status==='ACTIVE').length
  const mtdRevenue = invoices.filter(i=>i.status==='PAID').reduce((a,i)=>a+i.amountPaid,0)
  const pendingApprovals = projects.filter(p=>p.status==='PENDING').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-xl font-bold sm:text-2xl">Admin Dashboard</h1>
        <p className="text-[.88rem] mt-1" style={{color:'var(--muted)'}}>Full platform overview</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Active Projects" value={activeProjects} sub={`${projects.length} total`} />
        <StatCard label="Total Clients" value={users} sub="+5 this month" subColor="up" />
        <StatCard label="Revenue (MTD)" value={formatCurrency(mtdRevenue)} sub="+18% vs last month" subColor="up" />
        <StatCard label="Pending Approvals" value={pendingApprovals} sub={pendingApprovals > 0 ? `${pendingApprovals} need action` : 'All clear'} subColor={pendingApprovals > 0 ? 'down' : undefined} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
          <h2 className="font-semibold text-[.93rem] mb-4">All Projects</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[.82rem]">
              <thead><tr className="border-b" style={{borderColor:'var(--card-border)'}}>
                <th className="text-left pb-3 font-medium" style={{color:'var(--muted)'}}>Project</th>
                <th className="text-left pb-3 font-medium" style={{color:'var(--muted)'}}>Client</th>
                <th className="text-left pb-3 font-medium" style={{color:'var(--muted)'}}>Status</th>
                <th className="text-left pb-3 font-medium" style={{color:'var(--muted)'}}>Due</th>
              </tr></thead>
              <tbody>
                {projects.map(p=>(
                  <tr key={p.id} className="border-b last:border-0" style={{borderColor:'var(--card-border)'}}>
                    <td className="py-3 font-medium">{p.title}</td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{p.client.organization || p.client.name}</td>
                    <td className="py-3"><StatusBadge status={p.status}/></td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{p.dueDate ? formatDate(p.dueDate) : '—'}</td>
                  </tr>
                ))}
                {projects.length===0&&<tr><td colSpan={4} className="py-8 text-center" style={{color:'var(--muted)'}}>No projects yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[['+ New Project','#'],['Create Quote','#'],['Add Client','#'],['View Reports','#']].map(([label,href])=>(
                <a key={label} href={href} className="p-3 rounded-xl text-center text-[.82rem] font-medium border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]" style={{background:'rgba(255,255,255,.03)',borderColor:'var(--card-border)',color:'var(--muted)'}}>{label}</a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-5 flex-1" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Recent Activity</h2>
            <div className="flex flex-col">
              {activities.map((a,i)=>(
                <div key={a.id} className={`flex gap-3 py-2.5 ${i<activities.length-1?'border-b':''}`} style={{borderColor:'var(--card-border)'}}>
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{background:'var(--accent)'}}/>
                  <div>
                    <div className="text-[.82rem]">{a.action}{a.detail ? ` — ${a.detail}` : ''}</div>
                    <div className="text-[.73rem] mt-0.5" style={{color:'var(--muted)'}}>{formatDate(a.createdAt)}</div>
                  </div>
                </div>
              ))}
              {activities.length===0&&<p className="text-[.83rem]" style={{color:'var(--muted)'}}>No activity yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
