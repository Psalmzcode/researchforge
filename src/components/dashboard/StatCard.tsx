export function StatCard({ label, value, sub, subColor }: { label:string; value:string|number; sub?:string; subColor?:'up'|'down' }) {
  return (
    <div className="rounded-2xl p-5 border" style={{background:'var(--card-bg)',borderColor:'var(--card-border)'}}>
      <div className="text-[.78rem] mb-1.5" style={{color:'var(--muted)'}}>{label}</div>
      <div className="font-serif text-[1.8rem] font-bold leading-tight">{value}</div>
      {sub && <div className="text-[.73rem] mt-1" style={{color: subColor==='up'?'#00c6a2':subColor==='down'?'#e24b4a':'var(--muted)'}}>{sub}</div>}
    </div>
  )
}
