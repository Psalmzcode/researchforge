import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PayNowButton } from '@/components/dashboard/PayNowButton'

export default async function ClientDashboard() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any
  if (!user?.id) redirect('/login')

  const [projects, invoices] = await Promise.all([
    db.project.findMany({ where:{clientId:user.id}, include:{invoices:true,assignments:true}, orderBy:{createdAt:'desc'} }),
    db.invoice.findMany({ where:{clientId:user.id}, include:{project:{select:{title:true}},payments:true}, orderBy:{createdAt:'desc'} }),
  ])

  const totalSpent = invoices.reduce((a,i)=>a+i.amountPaid,0)
  const nextDue = invoices.find(i=>i.status==='SENT'||i.status==='OVERDUE')
  const reports = projects.filter(p=>p.status==='COMPLETE').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Welcome, {user.name?.split(' ')[0]}</h1>
        <p className="text-[.88rem] mt-1" style={{color:'var(--muted)'}}>Here&apos;s your project overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Projects" value={projects.length} sub={`${projects.filter(p=>p.status==='ACTIVE').length} active`} />
        <StatCard label="Total Spent" value={formatCurrency(totalSpent)} sub="Across all projects" />
        <StatCard label="Next Payment Due" value={nextDue ? formatDate(nextDue.dueDate!) : 'None'} sub={nextDue ? formatCurrency(nextDue.amount - nextDue.amountPaid) + ' balance' : 'All paid'} subColor={nextDue ? 'down' : 'up'} />
        <StatCard label="Reports Delivered" value={reports} sub="Download ready" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
          <h2 className="font-semibold text-[.93rem] mb-4">My Projects</h2>
          <div className="space-y-3">
            {projects.map(p=>{
              const paid = p.invoices.reduce((a,i)=>a+i.amountPaid,0)
              const total = p.invoices.reduce((a,i)=>a+i.amount,0)
              const pct = total > 0 ? Math.round(paid/total*100) : 0
              return (
                <div key={p.id} className="p-4 rounded-xl border" style={{borderColor:'var(--card-border)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[.9rem]">{p.title}</span>
                    <StatusBadge status={p.status}/>
                  </div>
                  <div className="text-[.78rem] mb-2" style={{color:'var(--muted)'}}>{p.service.replace('_',' ')} {p.dueDate ? `· Due ${formatDate(p.dueDate)}` : ''}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'var(--card-border)'}}>
                      <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:'var(--accent)'}}/>
                    </div>
                    <span className="text-[.73rem] font-medium" style={{color:'var(--accent)'}}>{pct}% paid</span>
                  </div>
                </div>
              )
            })}
            {projects.length===0&&<p className="py-8 text-center text-[.88rem]" style={{color:'var(--muted)'}}>No projects yet. <a href="/#contact" style={{color:'var(--accent)'}}>Request one →</a></p>}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Invoices & Payments</h2>
            <div className="space-y-2">
              {invoices.slice(0,4).map(inv=>(
                <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{borderColor:'var(--card-border)'}}>
                  <div>
                    <div className="text-[.82rem] font-medium">{inv.number}</div>
                    <div className="text-[.73rem]" style={{color:'var(--muted)'}}>{formatCurrency(inv.amount)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={inv.status}/>
                    {(inv.status==='SENT'||inv.status==='OVERDUE') && <PayNowButton invoiceId={inv.id}/>}
                  </div>
                </div>
              ))}
              {invoices.length===0&&<p className="text-[.83rem]" style={{color:'var(--muted)'}}>No invoices yet</p>}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[['+ New Request','/#contact'],['Download Report','#'],['Message Team','#'],['View All Invoices','/dashboard/client/invoices']].map(([l,h])=>(
                <a key={l} href={h} className="p-3 rounded-xl text-center text-[.78rem] font-medium border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]" style={{background:'rgba(255,255,255,.03)',borderColor:'var(--card-border)',color:'var(--muted)'}}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
