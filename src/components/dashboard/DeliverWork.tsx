'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeliverWork({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function deliver() {
    if (files.length === 0) return
    setLoading(true)
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    const res = await fetch(`/api/orders/${orderId}/deliver`, { method:'POST', body: fd })
    if (res.ok) { setDone(true); setFiles([]); router.refresh() }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border p-5 space-y-4" style={{ background:'var(--card-bg)',borderColor: done ? 'rgba(0,198,162,.3)' : 'var(--card-border)' }}>
      <h2 className="font-semibold text-sm">📤 Upload Deliverables</h2>
      {done ? (
        <div className="text-center py-4">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-sm font-bold" style={{ color:'var(--accent)' }}>Work delivered!</p>
          <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>Admin has been notified to review and approve</p>
        </div>
      ) : (
        <>
          <div className="border-2 border-dashed rounded-xl p-4 text-center"
            style={{ borderColor:'var(--card-border)' }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();setFiles(f=>[...f,...Array.from(e.dataTransfer.files)])}}>
            <label className="cursor-pointer text-sm" style={{ color:'var(--accent)' }}>
              Click or drag files here
              <input type="file" multiple className="hidden" onChange={e=>setFiles(f=>[...f,...Array.from(e.target.files||[])])}/>
            </label>
          </div>
          {files.length > 0 && (
            <div className="space-y-1">
              {files.map((f,i)=>(
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ background:'rgba(0,198,162,.05)' }}>
                  <span>📄 {f.name}</span>
                  <button onClick={()=>setFiles(f=>f.filter((_,j)=>j!==i))} className="text-red-400 ml-2">✕</button>
                </div>
              ))}
            </div>
          )}
          <button onClick={deliver} disabled={loading||files.length===0} className="w-full py-2.5 rounded-full text-xs font-bold disabled:opacity-50 transition-all hover:-translate-y-0.5" style={{ background:'var(--accent)',color:'var(--text-on-accent)' }}>
            {loading ? 'Uploading & Sending…' : `📦 Deliver ${files.length > 0 ? `${files.length} file(s)` : 'Work'}`}
          </button>
          <p className="text-[10px] text-center" style={{ color:'var(--muted)' }}>Files go to admin for review first, then client is notified</p>
        </>
      )}
    </div>
  )
}
