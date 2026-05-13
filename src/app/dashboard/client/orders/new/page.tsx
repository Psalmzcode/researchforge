'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'

const services = [
  { value: 'RESEARCH', label: 'Research & Data Solutions' },
  { value: 'DIGITAL_SURVEY', label: 'Digital Survey & Field Intelligence' },
  { value: 'SUSTAINABILITY', label: 'Sustainability & Environmental Consulting' },
  { value: 'ADVISORY', label: 'Advisory & Strategic Consulting' },
]

export default function NewOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [briefFiles, setBriefFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<{name:string;url:string;size:number;type:string}[]>([])
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([])
  const [form, setForm] = useState({
    title: '', description: '', service: '', priority: 'normal',
    deadline: '', budget: '', deliveryMethod: 'BOTH', deliveryEmail: '', notes: '',
    projectId: '',
  })

  const titleLen = form.title.trim().length
  const descLen = form.description.trim().length

  const inp = "w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all focus:border-[var(--accent)]"
  const inpStyle = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then((data: { id: string; title: string }[]) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
  }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function uploadBriefs() {
    const uploaded: { name: string; url: string; size: number; type: string }[] = []
    for (const file of briefFiles) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'briefs')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        uploaded.push(await res.json())
      } else {
        const err = await getJsonError(res)
        toast.error(`Upload failed (${file.name}): ${err}`)
        throw new Error('upload')
      }
    }
    setUploadedUrls(uploaded)
    return uploaded
  }

  async function submit() {
    if (titleLen < 3) {
      toast.error('Project title must be at least 3 characters.')
      setStep(1)
      return
    }
    if (!form.service) {
      toast.error('Please choose a service type.')
      setStep(1)
      return
    }
    if (descLen < 20) {
      toast.error('Project description must be at least 20 characters. Add more detail on step 2.')
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const uploads = briefFiles.length > 0 ? await uploadBriefs() : []

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          projectId: form.projectId || undefined,
          budget: form.budget ? parseFloat(form.budget) : undefined,
          briefFiles: uploads,
        }),
      })
      if (!res.ok) {
        toast.error(await getJsonError(res))
        return
      }
      const order = await res.json()
      if (uploads.length > 0) {
        const br = await fetch(`/api/orders/${order.id}/briefs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: uploads }),
        })
        if (!br.ok) {
          toast.error(`Order created but briefs failed to attach: ${await getJsonError(br)}`)
        }
      }
      toast.success('Order submitted. Our team will review it shortly.')
      router.push('/dashboard/client/orders')
    } catch (e) {
      if (e instanceof Error && e.message !== 'upload') {
        toast.error('Could not submit order. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Submit New Order</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Fill in your project brief so our team knows exactly what to deliver</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div onClick={() => s < step && setStep(s)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              style={{ background: step >= s ? 'var(--accent)' : 'var(--card-bg)', color: step >= s ? 'var(--text-on-accent)' : 'var(--muted)', border: '1.5px solid', borderColor: step >= s ? 'var(--accent)' : 'var(--card-border)' }}>
              {s}
            </div>
            {s < 3 && <div className="flex-1 h-[1.5px] w-12" style={{ background: step > s ? 'var(--accent)' : 'var(--card-border)' }}/>}
          </div>
        ))}
        <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>
          {step === 1 ? 'Project Details' : step === 2 ? 'Brief & Files' : 'Delivery'}
        </span>
      </div>

      <div className="rounded-2xl border p-8 space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="font-semibold">Project Details</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Project Title *</label>
                <input className={inp} style={inpStyle} placeholder="e.g. Market Survey — Lagos Retail Sector" value={form.title} onChange={e => set('title', e.target.value)} required/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Service Type *</label>
                <select className={inp} style={inpStyle} value={form.service} onChange={e => set('service', e.target.value)} required>
                  <option value="" disabled>Choose a service</option>
                  {services.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Link to existing project (optional)</label>
                <select className={inp} style={inpStyle} value={form.projectId} onChange={e => set('projectId', e.target.value)}>
                  <option value="">No link — standalone order</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Required for <strong>installment payment gating</strong>: orders tied to a project use that project&apos;s installment invoices to control when final deliverables are released.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Priority</label>
                  <select className={inp} style={inpStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Deadline</label>
                  <input type="date" className={inp} style={inpStyle} value={form.deadline} onChange={e => set('deadline', e.target.value)}/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Estimated Budget (₦)</label>
                <input type="number" className={inp} style={inpStyle} placeholder="e.g. 500000" value={form.budget} onChange={e => set('budget', e.target.value)}/>
              </div>
            </div>
            <button onClick={() => { if (titleLen >= 3 && form.service) setStep(2) }}
              className="w-full py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }} disabled={titleLen < 3 || !form.service}>
              Next: Add Brief →
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="font-semibold">Project Brief & Files</h2>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>The more detail you provide, the better our researchers can serve you.</p>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Project Description *</label>
                <textarea rows={6} className={`${inp} resize-y`} style={inpStyle}
                  placeholder="Describe your project in detail:&#10;• What is the objective?&#10;• Who is the target audience?&#10;• What geography / scope?&#10;• What output do you expect?&#10;• Any specific methodology preferences?"
                  value={form.description} onChange={e => set('description', e.target.value)} required/>
                <p className="text-[11px]" style={{ color: descLen > 0 && descLen < 20 ? '#e24b4a' : 'var(--muted)' }}>
                  {descLen}/20 characters minimum (leading/trailing spaces don&apos;t count)
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Additional Notes</label>
                <textarea rows={3} className={`${inp} resize-y`} style={inpStyle}
                  placeholder="Any other context, constraints, or preferences our team should know..."
                  value={form.notes} onChange={e => set('notes', e.target.value)}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Upload Brief Documents</label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all"
                  style={{ borderColor: 'var(--card-border)' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setBriefFiles(f => [...f, ...Array.from(e.dataTransfer.files)]) }}>
                  <p className="text-2xl mb-2">📎</p>
                  <p className="text-sm font-medium">Drag & drop files or</p>
                  <label className="cursor-pointer text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    browse to upload
                    <input type="file" multiple className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.png"
                      onChange={e => setBriefFiles(f => [...f, ...Array.from(e.target.files || [])])}/>
                  </label>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>PDF, Word, Excel, PPT, images — up to 50MB each</p>
                </div>
                {briefFiles.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {briefFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--card-border)', background: 'rgba(0,198,162,.05)' }}>
                        <span>📄 {f.name} <span className="text-xs" style={{ color: 'var(--muted)' }}>({(f.size/1024).toFixed(0)}KB)</span></span>
                        <button onClick={() => setBriefFiles(f => f.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 ml-3 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-full font-bold text-sm border transition-all" style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>← Back</button>
              <button type="button" onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }} disabled={descLen < 20}>
                Next: Delivery →
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h2 className="font-semibold">Delivery Preferences</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>How do you want to receive your work?</label>
                {[['DOWNLOAD','📥 Download from dashboard (default)'],['EMAIL','📧 Send to my email'],['BOTH','📥 + 📧 Both (recommended)']].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all" style={{ borderColor: form.deliveryMethod === v ? 'var(--accent)' : 'var(--card-border)', background: form.deliveryMethod === v ? 'rgba(0,198,162,.06)' : 'transparent' }}>
                    <input type="radio" name="delivery" value={v} checked={form.deliveryMethod === v} onChange={() => set('deliveryMethod', v)} className="accent-[var(--accent)]"/>
                    <span className="text-sm font-medium">{l}</span>
                  </label>
                ))}
              </div>
              {(form.deliveryMethod === 'EMAIL' || form.deliveryMethod === 'BOTH') && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>Delivery Email (leave blank to use your account email)</label>
                  <input type="email" className={inp} style={inpStyle} placeholder="alternate@email.com" value={form.deliveryEmail} onChange={e => set('deliveryEmail', e.target.value)}/>
                </div>
              )}
              {/* Summary */}
              <div className="rounded-xl p-4 border space-y-2" style={{ borderColor: 'var(--card-border)', background: 'rgba(0,198,162,.04)' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>Order Summary</p>
                <p className="text-sm"><strong>{form.title}</strong></p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{services.find(s=>s.value===form.service)?.label} · {form.priority} priority {form.deadline ? `· Due ${form.deadline}` : ''}</p>
                {briefFiles.length > 0 && <p className="text-xs" style={{ color: 'var(--muted)' }}>{briefFiles.length} brief file(s) attached</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-full font-bold text-sm border transition-all" style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}>← Back</button>
              <button onClick={submit} disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 py-3 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-70"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                {loading ? (
                  <>
                    <Spinner size="sm" label="Submitting order" />
                    <span>Submitting…</span>
                  </>
                ) : (
                  '✓ Submit Order'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
