'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navByRole: Record<string,{label:string;href:string;icon:string}[]> = {
  ADMIN: [
    { label:'Overview',       href:'/dashboard/admin',           icon:'📊' },
    { label:'Orders',         href:'/dashboard/admin/orders',    icon:'📦' },
    { label:'Projects',       href:'/dashboard/admin/projects',  icon:'📁' },
    { label:'Clients',        href:'/dashboard/admin/clients',   icon:'👥' },
    { label:'Invoices',       href:'/dashboard/admin/invoices',  icon:'🧾' },
    { label:'Team',           href:'/dashboard/admin/team',      icon:'🔬' },
    { label:'Staff payouts',  href:'/dashboard/finance/payouts', icon:'👷' },
    { label:'Email templates',href:'/dashboard/admin/emails',  icon:'✉️' },
    { label:'Settings',       href:'/dashboard/admin/settings',  icon:'⚙️'  },
  ],
  CLIENT: [
    { label:'Overview',           href:'/dashboard/client',              icon:'🏠' },
    { label:'My Orders',          href:'/dashboard/client/orders',       icon:'📦' },
    { label:'Submit New Order',   href:'/dashboard/client/orders/new',   icon:'➕' },
    { label:'Invoices & Payments',href:'/dashboard/client/invoices',     icon:'💳' },
    { label:'Reports & Files',    href:'/dashboard/client/reports',      icon:'📄' },
    { label:'Messages',           href:'/dashboard/client/messages',     icon:'💬' },
  ],
  RESEARCHER: [
    { label:'My Tasks',       href:'/dashboard/researcher',              icon:'📋' },
    { label:'Assigned Orders',href:'/dashboard/researcher/orders',       icon:'📦' },
    { label:'Projects',       href:'/dashboard/researcher/projects',     icon:'📁' },
    { label:'Data Collection',href:'/dashboard/researcher/data',         icon:'📊' },
  ],
  FINANCE: [
    { label:'Overview',       href:'/dashboard/finance',           icon:'💰' },
    { label:'Staff payouts',  href:'/dashboard/finance/payouts',   icon:'👷' },
    { label:'Invoices',       href:'/dashboard/finance/invoices',  icon:'🧾' },
    { label:'Payments',       href:'/dashboard/finance/payments',  icon:'💳' },
    { label:'Revenue Report', href:'/dashboard/finance/revenue',   icon:'📈' },
  ],
}

const roleColors: Record<string,string> = {
  ADMIN:'rgba(55,138,221,.2)',CLIENT:'rgba(0,198,162,.2)',RESEARCHER:'rgba(240,165,0,.2)',FINANCE:'rgba(226,75,74,.2)'
}
const roleTextColors: Record<string,string> = {
  ADMIN:'#378add',CLIENT:'var(--accent)',RESEARCHER:'#f0a500',FINANCE:'#e24b4a'
}

type SidebarProps = {
  user: any
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export function DashboardSidebar({ user, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const role = typeof user?.role === 'string' ? user.role : 'CLIENT'
  const links = navByRole[role] || navByRole.CLIENT

  function isActive(href: string) {
    if (href === `/dashboard/${role.toLowerCase()}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      id="dashboard-sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex min-h-screen w-[min(100vw,15rem)] flex-shrink-0 flex-col border-r transition-transform duration-200 ease-out sm:w-56 lg:static lg:z-auto lg:min-h-screen lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{ background: 'var(--navy-mid)', borderColor: 'var(--card-border)' }}
    >
      {/* Brand */}
      <div className="flex items-start justify-between gap-2 border-b px-4 py-4 sm:px-5 sm:py-5" style={{ borderColor: 'var(--card-border)' }}>
        <div className="min-w-0">
          <Link href="/" className="font-serif text-lg font-bold sm:text-xl" style={{ color: 'var(--text)' }} onClick={onCloseMobile}>
            Research<span style={{ color: 'var(--accent)' }}>Forge</span>
          </Link>
          <div className="mt-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: roleColors[role] || 'rgba(0,198,162,.2)', color: roleTextColors[role] || 'var(--accent)' }}>
            {(user.name || 'U')[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[.78rem] font-medium truncate" style={{ color: 'var(--text)' }}>{user.name || user.email}</div>
            <div className="text-[.65rem] px-1.5 py-0.5 rounded inline-block font-semibold mt-0.5"
              style={{ background: roleColors[role], color: roleTextColors[role] }}>
              {role}
            </div>
          </div>
          </div>
        </div>
        <button
          type="button"
          className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border lg:hidden"
          style={{ borderColor: 'var(--card-border)', color: 'var(--muted)' }}
          aria-label="Close menu"
          onClick={onCloseMobile}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3 sm:px-3 sm:py-4">
        {links.map(l => {
          const active = isActive(l.href)
          return (
            <Link key={l.href} href={l.href}
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[.8rem] font-medium transition-all duration-150 sm:text-[.83rem]"
              style={{
                background: active ? 'rgba(0,198,162,.1)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              <span className="flex-shrink-0 text-base">{l.icon}</span>
              <span className="truncate">{l.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t px-2 py-3 sm:px-3 sm:py-4" style={{ borderColor: 'var(--card-border)' }}>
        <Link href="/" onClick={onCloseMobile} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[.8rem] font-medium transition-all sm:text-[.83rem]" style={{ color: 'var(--muted)' }}>
          <span>🌐</span><span>View Website</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[.83rem] font-medium transition-all hover:bg-[rgba(226,75,74,.08)] hover:text-[#e24b4a]"
          style={{ color: 'var(--muted)', background: 'transparent', border: 'none' }}>
          <span>🚪</span><span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
