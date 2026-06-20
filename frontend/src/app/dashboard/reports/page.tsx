'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { api, fetcher } from '@/lib/api'
import { ReportSummary } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

type Period = 'daily' | 'weekly' | 'monthly' | 'annual'

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [refDate, setRefDate] = useState(new Date().toISOString().split('T')[0])

  const { data: report, isLoading } = useSWR<ReportSummary>(
    `/reports/summary?period=${period}&reference_date=${refDate}`,
    fetcher<ReportSummary>
  )

  const periods: { value: Period; label: string }[] = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'annual', label: 'Anual' },
  ]

  const pctColor = (v: number | null) => {
    if (v === null) return 'text-text-secondary'
    return v > 0 ? 'text-danger' : 'text-success'
  }

  const pctLabel = (v: number | null, inverse = false) => {
    if (v === null) return '—'
    const isPositive = inverse ? v < 0 : v > 0
    return `${isPositive ? '+' : ''}${v.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {periods.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary border border-border-dark hover:text-text-primary'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="date" value={refDate} onChange={e => setRefDate(e.target.value)}
          className="bg-bg-card border border-border-dark text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => alert('Funcionalidade de exportação em breve! 🚀')}
          className="flex items-center gap-2 bg-bg-card border border-border-dark text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg text-sm transition-colors">
          <FileText size={14} /> Exportar PDF
        </button>
      </div>

      {report && (
        <div className="text-text-secondary text-sm">
          Período: <span className="text-text-primary font-medium">
            {formatDate(report.start)} — {formatDate(report.end)}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse bg-bg-card rounded-xl" />)}
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Receitas', value: report.revenues, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', change: report.comparison.revenues_change },
              { label: 'Despesas', value: report.expenses, icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10', change: report.comparison.expenses_change },
              { label: report.profit >= 0 ? 'Lucro' : 'Prejuízo', value: report.profit, icon: DollarSign, color: report.profit >= 0 ? 'text-success' : 'text-danger', bg: report.profit >= 0 ? 'bg-success/10' : 'bg-danger/10', change: report.comparison.profit_change },
              { label: 'Economia', value: report.savings, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', change: null },
            ].map(card => {
              const Icon = card.icon
              return (
                <div key={card.label} className="bg-bg-card border border-border-dark rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-text-secondary text-xs">{card.label}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                      <Icon size={16} className={card.color} />
                    </div>
                  </div>
                  <p className={`text-xl font-bold ${card.color}`}>{formatCurrency(Math.abs(card.value))}</p>
                  {card.change !== null && card.change !== undefined && (
                    <p className={`text-xs mt-1 ${pctColor(card.change)}`}>
                      {pctLabel(card.change)} vs período anterior
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-bg-card border border-border-dark rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border-dark">
                <h3 className="text-text-primary font-semibold text-sm">💚 Receitas do período</h3>
              </div>
              <div className="divide-y divide-border-dark/50">
                {report.transactions.revenues.length === 0 ? (
                  <p className="text-text-secondary text-sm p-4 text-center">Sem receitas neste período</p>
                ) : report.transactions.revenues.map((t, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3">
                    <div>
                      <p className="text-text-primary text-sm">{t.description}</p>
                      <p className="text-text-secondary text-xs">{formatDate(t.date)}</p>
                    </div>
                    <span className="text-success font-semibold text-sm">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-card border border-border-dark rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border-dark">
                <h3 className="text-text-primary font-semibold text-sm">❤️ Despesas do período</h3>
              </div>
              <div className="divide-y divide-border-dark/50">
                {report.transactions.expenses.length === 0 ? (
                  <p className="text-text-secondary text-sm p-4 text-center">Sem despesas neste período</p>
                ) : report.transactions.expenses.map((t, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3">
                    <div>
                      <p className="text-text-primary text-sm">{t.description}</p>
                      <p className="text-text-secondary text-xs">{formatDate(t.date)} · {t.payment_method}</p>
                    </div>
                    <span className="text-danger font-semibold text-sm">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
