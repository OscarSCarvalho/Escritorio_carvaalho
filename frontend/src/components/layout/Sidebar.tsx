'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Tag, Target,
  FileText, Bot, Radar, Settings, LogOut, Menu, X, DollarSign
} from 'lucide-react'
import { removeToken } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/revenues', label: 'Receitas', icon: TrendingUp },
  { href: '/dashboard/expenses', label: 'Despesas', icon: TrendingDown },
  { href: '/dashboard/categories', label: 'Categorias', icon: Tag },
  { href: '/dashboard/goals', label: 'Metas', icon: Target },
  { href: '/dashboard/reports', label: 'Relatórios', icon: FileText },
  { href: '/dashboard/ai-assistant', label: 'Assistente IA', icon: Bot },
  { href: '/dashboard/radar', label: 'Radar Financeiro', icon: Radar },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    removeToken()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <img src="/carvalho-logo.svg" alt="Carvalho" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <p className="text-text-primary font-bold text-sm leading-tight">Escritório Virtual</p>
            <p className="text-text-secondary text-xs">Família Carvalho</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border-dark">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-sidebar border-r border-border-dark fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-bg-card border border-border-dark rounded-lg text-text-secondary"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-bg-sidebar border-r border-border-dark flex flex-col">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 text-text-secondary hover:text-text-primary"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
