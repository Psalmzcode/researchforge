'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/Spinner'
import { getJsonError } from '@/lib/api-error'

type ClientUser = { id: string; name: string | null; email: string; organization: string | null; role: string }

const services = [
  { value: 'RESEARCH', label: 'Research & Data' },
  { value: 'DIGITAL_SURVEY', label: 'Digital Survey' },
  { value: 'SUSTAINABILITY', label: 'Sustainability' },
  { value: 'ADVISORY', label: 'Advisory' },
] as const

export function AdminNewProjectForm() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientUser[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    service: '',
    clientId: '',
    dueDate: '',
    budget: '',
  })

  const inp = 'w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all focus:border-[var(--accent)]'
  const inpStyle = { background: 'rgba(255,255,255,.05)', borderColor: 'var(--card-border)', color: 'var(--text)' }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/users')
        if (!res.ok) {
          toast.error(await getJsonError(res))
          return
        }
        const users: ClientUser[] = await res.json()
        if (!cancelled) {
          setClients(users.filter((u) => u.role === 'CLIENT'))
        }
      } catch {
        if (!cancelled) toast.error('Could not load clients.')
      } finally {
        if (!cancelled) setLoadingClients(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.title.trim().length < 2) {
      toast.error('Title must be at least 2 characters.')
      return
    }
    if (!form.service) {
      toast.error('Choose a service type.')
      return
    }
    if (!form.clientId) {
      toast.error('Select a client.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          service: form.service,
          clientId: form.clientId,
          dueDate: form.dueDate || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
        }),
      })
      if (!res.ok) {
        toast.error(await getJsonError(res))
        return
      }
      const created = await res.json()
      toast.success('Project created.')
      router.push(`/dashboard/admin/projects/${created.id}`)
      router.refresh()
    } catch {
      toast.error('Could not create project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/admin/projects" className="text-xs" style={{ color: 'var(--muted)' }}>
          ← Projects
        </Link>
        <h1 className="font-serif text-2xl font-bold mt-1">New project</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Create a client project for orders, quotes, and invoices. Link orders to this project from the order screen.
        </p>
      </div>

      {loadingClients ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" label="Loading clients" />
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <p className="text-sm font-medium">No client accounts yet</p>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
            Add or invite clients first, then return to create a project.
          </p>
          <Link
            href="/dashboard/admin/clients"
            className="inline-block mt-4 text-sm font-bold"
            style={{ color: 'var(--accent)' }}
          >
            Go to Clients →
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border p-8 space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
              Client *
            </label>
            <select
              required
              className={inp}
              style={inpStyle}
              value={form.clientId}
              onChange={(e) => set('clientId', e.target.value)}
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.organization || c.name || c.email} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
              Project title *
            </label>
            <input
              className={inp}
              style={inpStyle}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Lagos retail survey Q2"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
              Service *
            </label>
            <select className={inp} style={inpStyle} value={form.service} onChange={(e) => set('service', e.target.value)} required>
              <option value="">Choose…</option>
              {services.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
              Description (optional)
            </label>
            <textarea
              rows={4}
              className={`${inp} resize-y`}
              style={inpStyle}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Scope, deliverables, or context…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
                Due date (optional)
              </label>
              <input type="date" className={inp} style={inpStyle} value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wide" style={{ color: 'var(--muted)' }}>
                Budget (₦, optional)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                className={inp}
                style={inpStyle}
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
                placeholder="e.g. 500000"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              {saving ? (
                <>
                  <Spinner size="sm" label="Creating" />
                  Creating…
                </>
              ) : (
                'Create project'
              )}
            </button>
            <Link
              href="/dashboard/admin/projects"
              className="inline-flex items-center justify-center rounded-full border px-6 py-2.5 text-sm font-bold"
              style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
