'use client'
import { Wallet, TrendingUp, TrendingDown, DollarSign, PiggyBank, Target } from 'lucide-react'
import { DashboardSummary } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  data: DashboardSummary
}

export default function SummaryCards({ data }: Props) {
  const cards = [
    {
      label: 'Saldo Atual',
      value: data.current_balance,
      icon: Wallet,
      color: data.current_balance >= 0 ? 'text-success' : 'text-danger',
      bg: data.current_balance >= 0 ? 'bg-success/10' : 'bg-danger/10',
    },
    {
      label: 'Receitas do Mês',
      value: data.monthly_revenue,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Despesas do Mês',
      value: data.monthly_expenses,
      icon: TrendingDown,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
    {
      label: data.monthly_profit >= 0 ? 'Lucro do Mês' : 'Prejuízo do Mês',
      value: data.monthly_profit,
      icon: DollarSign,
      color: data.monthly_profit >= 0 ? 'text-success' : 'text-danger',
      bg: data.monthly_profit >= 0 ? 'bg-success/10' : 'bg-danger/10',
    },
    {
      label: 'Economia Acumulada',
      value: data.accumulated_savings,
      icon: PiggyBank,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.slice(0, 4).map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-bg-card border border-border-dark rounded-xl p-5 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm">{card.label}</span>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', card.bg)}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
              <p className={cn('text-2xl font-bold', card.color)}>
                {formatCurrency(Math.abs(card.value))}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-bg-card border border-border-dark rounded-xl p-5 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Economia Acumulada</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10">
              <PiggyBank size={18} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">{formatCurrency(data.accumulated_savings)}</p>
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl p-5 hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-text-secondary text-sm">Meta Mensal</span>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-warning/10">
              <Target size={18} className="text-warning" />
            </div>
          </div>
          <p className="text-xl font-bold text-text-primary mb-2">{formatCurrency(data.monthly_goal)}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>{formatCurrency(data.monthly_revenue)} atingido</span>
              <span>{data.goal_percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, data.goal_percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
