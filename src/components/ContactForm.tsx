'use client'
import { useState } from 'react'

export function ContactForm() {
  const [status, setStatus] = useState<'idle'|'loading'|'sent'|'error'>('idle')
  const [form, setForm] = useState({ name:'', organization:'', email:'', service:'', message:'' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if (res.ok) setStatus('sent')
      else setStatus('error')
    } catch { setStatus('error') }
  }

  const inputStyle = "w-full rounded-xl px-4 py-3 text-[.9rem] outline-none transition-all duration-200 border focus:border-[var(--accent)] focus:bg-[rgba(0,198,162,.05)]"
  const inputBase = { background:'rgba(255,255,255,.05)', borderColor:'var(--card-border)', color:'var(--text)' }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] p-10 text-left border" style={{background:'rgba(255,255,255,.04)',borderColor:'var(--card-border)'}}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Full Name</label>
          <input type="text" required placeholder="Your full name" style={inputBase} className={inputStyle} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Organization</label>
          <input type="text" placeholder="Company or institution" style={inputBase} className={inputStyle} value={form.organization} onChange={e=>setForm(f=>({...f,organization:e.target.value}))}/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Email Address</label>
          <input type="email" required placeholder="you@organization.com" style={inputBase} className={inputStyle} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Service Interest</label>
          <select style={inputBase} className={inputStyle} value={form.service} onChange={e=>setForm(f=>({...f,service:e.target.value}))}>
            <option value="" disabled>Select a service</option>
            <option>Research & Data Solutions</option>
            <option>Digital Survey & Field Intelligence</option>
            <option>Sustainability & Environmental Consulting</option>
            <option>Advisory & Strategic Consulting</option>
            <option>Multiple / Not Sure Yet</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[.77rem] font-semibold tracking-[.04em]" style={{color:'var(--muted)'}}>Tell Us About Your Project</label>
          <textarea required rows={4} placeholder="Describe your challenge, goal, or what you need help with..." style={inputBase} className={`${inputStyle} resize-y`} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/>
        </div>
      </div>
      <button type="submit" disabled={status==='loading'||status==='sent'}
        className="w-full py-4 rounded-full text-[.93rem] font-bold border-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,198,162,.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        style={{background: status==='sent'?'#00a882':'var(--accent)', color:'var(--text-on-accent)'}}>
        {status==='loading'?'Sending…':status==='sent'?'✓ Sent! We\'ll be in touch within 24 hours.':status==='error'?'Error — try again':'Send Your Request →'}
      </button>
    </form>
  )
}
