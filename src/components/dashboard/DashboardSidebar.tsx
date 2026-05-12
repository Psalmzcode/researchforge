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

export function DashboardSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const role = typeof user?.role === 'string' ? user.role : 'CLIENT'
  const links = navByRole[role] || navByRole.CLIENT

  function isActive(href: string) {
    if (href === `/dashboard/${role.toLowerCase()}`) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r min-h-screen"
      style={{ background: 'var(--navy-mid)', borderColor: 'var(--card-border)' }}>
      {/* Brand */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <Link href="/" className="font-serif text-xl font-bold" style={{ color: 'var(--text)' }}>
          Research<span style={{ color: 'var(--accent)' }}>Forge</span>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: roleColors[role] || 'rgba(0,198,162,.2)', color: roleTextColors[role] || 'var(--accent)' }}>
            {(user.name || 'U')[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[.78rem] font-medium truncate" style={{ color: 'var(--text)' }}>{user.name}</div>
            <div className="text-[.65rem] px-1.5 py-0.5 rounded inline-block font-semibold mt-0.5"
              style={{ background: roleColors[role], color: roleTextColors[role] }}>
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {links.map(l => {
          const active = isActive(l.href)
          return (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[.83rem] font-medium transition-all duration-150"
              style={{
                background: active ? 'rgba(0,198,162,.1)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              <span className="text-base flex-shrink-0">{l.icon}</span>
              <span className="truncate">{l.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: 'var(--card-border)' }}>
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[.83rem] font-medium transition-all" style={{ color: 'var(--muted)' }}>
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
