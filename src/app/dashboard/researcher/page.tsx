import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { formatDate } from '@/lib/utils'

export default async function ResearcherDashboard() {
  const session = await auth()
  if (!session) redirect('/login')
  const user = session.user as any

  const [assignments, projects] = await Promise.all([
    db.assignment.findMany({ where:{userId:user.id}, include:{project:{include:{client:{select:{name:true,organization:true}}}}}, orderBy:{createdAt:'desc'} }),
    db.project.findMany({ where:{assignments:{some:{userId:user.id}}}, include:{assignments:{where:{userId:user.id}}} }),
  ])

  const pending = assignments.filter(a=>!a.completedAt).length
  const done = assignments.filter(a=>a.completedAt).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">My Tasks</h1>
        <p className="text-[.88rem] mt-1" style={{color:'var(--muted)'}}>Field assignments and data collection</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Tasks" value={assignments.length} sub={`${pending} active`} />
        <StatCard label="Active Projects" value={projects.length} sub="Assigned to me" />
        <StatCard label="Tasks Complete" value={done} sub={done > 0 ? 'Great work!' : 'Keep going'} subColor={done > 0 ? 'up' : undefined} />
        <StatCard label="Pending Review" value={pending} sub="Awaiting QC check" subColor={pending > 0 ? 'down' : undefined} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
          <h2 className="font-semibold text-[.93rem] mb-4">Task Assignments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[.82rem]">
              <thead><tr className="border-b" style={{borderColor:'var(--card-border)'}}>
                {['Task','Project','Client','Progress','Status'].map(h=><th key={h} className="text-left pb-3 font-medium" style={{color:'var(--muted)'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {assignments.map(a=>(
                  <tr key={a.id} className="border-b last:border-0" style={{borderColor:'var(--card-border)'}}>
                    <td className="py-3 font-medium">{a.task || 'Assignment'}</td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{a.project.title}</td>
                    <td className="py-3" style={{color:'var(--muted)'}}>{a.project.client.organization || a.project.client.name}</td>
                    <td className="py-3 w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'var(--card-border)'}}>
                          <div className="h-full rounded-full" style={{width:`${a.progress}%`,background:'var(--accent)'}}/>
                        </div>
                        <span className="text-[.73rem]" style={{color:'var(--accent)'}}>{a.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3"><StatusBadge status={a.completedAt ? 'COMPLETE' : 'ACTIVE'}/></td>
                  </tr>
                ))}
                {assignments.length===0&&<tr><td colSpan={5} className="py-8 text-center" style={{color:'var(--muted)'}}>No assignments yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              {[['📋 Open ODK Form','#'],['📤 Submit Data','#'],['🚩 Log Issue','#'],['📄 View Brief','#']].map(([l,h])=>(
                <a key={l} href={h} className="p-3 rounded-xl text-center text-[.83rem] font-medium border transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]" style={{background:'rgba(255,255,255,.03)',borderColor:'var(--card-border)',color:'var(--muted)'}}>{l}</a>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-5" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
            <h2 className="font-semibold text-[.93rem] mb-4">Collection Progress</h2>
            {projects.map(p=>{
              const asgn = p.assignments[0]
              return (
                <div key={p.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-[.78rem] mb-1">
                    <span className="truncate max-w-[160px]" style={{color:'var(--muted)'}}>{p.title}</span>
                    <span style={{color:'var(--accent)'}}>{asgn?.progress||0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{background:'var(--card-border)'}}>
                    <div className="h-full rounded-full" style={{width:`${asgn?.progress||0}%`,background:'var(--accent)'}}/>
                  </div>
                </div>
              )
            })}
            {projects.length===0&&<p className="text-[.83rem]" style={{color:'var(--muted)'}}>No projects assigned</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
