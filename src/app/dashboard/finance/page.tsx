import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function FinanceDashboard() {
  const session = await auth()
  if (!session || !['FINANCE','ADMIN'].includes((session.user as any).role)) redirect('/login')

  const invoices = await db.invoice.findMany({
    include: { project:{select:{title:true,service:true}}, client:{select:{name:true,organization:true}}, payments:true },
    orderBy: { createdAt:'desc' },
  })

  const totalRevenue = invoices.filter(i=>i.status==='PAID').reduce((a,i)=>a+i.amountPaid,0)
  const outstanding = invoices.filter(i=>i.status!=='PAID'&&i.status!=='CANCELLED').reduce((a,i)=>a+(i.amount-i.amountPaid),0)
  const overdue = invoices.filter(i=>i.status==='OVERDUE').length
  const avgDays = 8.4

  const byService: Record<string,number> = {}
  invoices.filter(i=>i.status==='PAID').forEach(i=>{ byService[i.project.service] = (byService[i.project.service]||0)+i.amountPaid })
  const totalSvc = Object.values(byService).reduce((a,b)=>a+b,0)||1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Finance Overview</h1>
        <p className="text-[.88rem] mt-1" style={{color:'var(--muted)'}}>Revenue, invoices, and payment tracking</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} sub="+24% vs last year" subColor="up" />
        <StatCard label="Outstanding Invoices" value={formatCurrency(outstanding)} sub={`${invoices.filter(i=>i.status==='SENT').length} invoices pending`} subColor="down" />
        <StatCard label="Overdue Payments" value={overdue} sub={overdue > 0 ? 'Needs follow-up' : 'All on time'} subColor={overdue > 0 ? 'down' : 'up'} />
        <StatCard label="Avg. Days to Pay" value={`${avgDays}`} sub="Down from 11.2" subColor="up" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
          <h2 className="font-semibold text-[.93rem] mb-4">Invoice Tracker</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[.82rem]">
              <thead><tr className="border-b" style={{borderColor:'var(--card-border)'}}>
                {['Invoice','Client','Amount','Type','Due','Status'].map(h=><th key={h} className="text-left pb-3 font-medium" style={{color:'var(--muted)'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {invoices.map(inv=>(
                  <tr key={inv.id} className="border-b last:border-0" style={{borderColor:'var(--card-border)'}}>
                    <td className="py-3 font-medium" style={{color:'var(--accent)'}}>{inv.number}</td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{inv.client.organization || inv.client.name}</td>
                    <td className="py-3 font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{inv.paymentType}</td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{inv.dueDate ? formatDate(inv.dueDate) : '—'}</td>
                    <td className="py-3"><StatusBadge status={inv.status}/></td>
                  </tr>
                ))}
                {invoices.length===0&&<tr><td colSpan={6} className="py-8 text-center" style={{color:'var(--muted)'}}>No invoices yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[['Create Invoice','#'],['Send Reminder','#'],['Export CSV','#'],['Revenue Report','#']].map(([l,h])=>(
                <a key={l} href={h} className="p-3 rounded-xl text-center text-[.78rem] font-medium border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]" style={{background:'rgba(255,255,255,.03)',borderColor:'var(--card-border)',color:'var(--muted)'}}>{l}</a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Revenue by Service</h2>
            {Object.entries(byService).map(([svc,amt])=>{
              const pct = Math.round(amt/totalSvc*100)
              const colors: Record<string,string> = {RESEARCH:'var(--accent)',DIGITAL_SURVEY:'#f0a500',SUSTAINABILITY:'#378add',ADVISORY:'#d4537e'}
              return (
                <div key={svc} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-[.78rem] mb-1">
                    <span style={{color:'var(--muted)'}}>{svc.replace('_',' ')}</span>
                    <span style={{color:colors[svc]||'var(--accent)'}}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--card-border)'}}>
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:colors[svc]||'var(--accent)'}}/>
                  </div>
                </div>
              )
            })}
            {Object.keys(byService).length===0&&<p className="text-[.83rem]" style={{color:'var(--muted)'}}>No paid invoices yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
