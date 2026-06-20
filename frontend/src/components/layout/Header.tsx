'use client'
import { usePathname } from 'next/navigation'
import { getUser } from '@/lib/auth'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/revenues': 'Receitas',
  '/dashboard/expenses': 'Despesas',
  '/dashboard/categories': 'Categorias',
  '/dashboard/goals': 'Metas Financeiras',
  '/dashboard/reports': 'Relatórios',
  '/dashboard/ai-assistant': 'Assistente IA',
  '/dashboard/radar': 'Radar Financeiro',
  '/dashboard/settings': 'Configurações',
}

export default function Header() {
  const pathname = usePathname()
  const user = getUser()
  const title = pageTitles[pathname] || 'Dashboard'
  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'

  return (
    <header className="h-16 border-b border-border-dark bg-bg-dark/80 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-text-secondary text-sm hidden sm:block">{user?.name}</span>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  )
}
