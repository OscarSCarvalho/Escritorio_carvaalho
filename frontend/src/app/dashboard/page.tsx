'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { getCurrentMonth } from '@/lib/utils'
import { DashboardSummary, ChartData } from '@/types'
import SummaryCards from '@/components/dashboard/SummaryCards'
import DonutChart from '@/components/dashboard/DonutChart'
import BarChart from '@/components/dashboard/BarChart'
import LineChart from '@/components/dashboard/LineChart'
import AreaChart from '@/components/dashboard/AreaChart'
import TopExpenses from '@/components/dashboard/TopExpenses'

export default function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth())

  const { data: summary, isLoading: loadingSummary } = useSWR<DashboardSummary>(
    `/dashboard/summary?month=${month}`,
    fetcher<DashboardSummary>
  )

  const { data: charts, isLoading: loadingCharts } = useSWR<ChartData>(
    '/dashboard/charts',
    fetcher<ChartData>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-text-secondary text-sm">Visão geral de</h2>
        </div>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="bg-bg-card border border-border-dark text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-card border border-border-dark rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : summary ? (
        <SummaryCards data={summary} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border-dark rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Despesas por Categoria</h3>
          {loadingCharts ? (
            <div className="h-48 animate-pulse bg-slate-700/30 rounded-lg" />
          ) : (
            <DonutChart data={charts?.expense_distribution || []} />
          )}
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Receitas × Despesas (6 meses)</h3>
          {loadingCharts ? (
            <div className="h-48 animate-pulse bg-slate-700/30 rounded-lg" />
          ) : (
            <BarChart data={charts?.monthly_comparison || []} />
          )}
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Evolução do Patrimônio</h3>
          {loadingCharts ? (
            <div className="h-48 animate-pulse bg-slate-700/30 rounded-lg" />
          ) : (
            <LineChart data={charts?.patrimony_evolution || []} />
          )}
        </div>

        <div className="bg-bg-card border border-border-dark rounded-xl p-5">
          <h3 className="text-text-primary font-semibold mb-4">Fluxo de Caixa</h3>
          {loadingCharts ? (
            <div className="h-48 animate-pulse bg-slate-700/30 rounded-lg" />
          ) : (
            <AreaChart data={charts?.cashflow || []} />
          )}
        </div>
      </div>

      <div className="bg-bg-card border border-border-dark rounded-xl p-5">
        <h3 className="text-text-primary font-semibold mb-4">🏆 Top 10 Maiores Gastos do Mês</h3>
        {loadingSummary ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 animate-pulse bg-slate-700/30 rounded" />
            ))}
          </div>
        ) : (
          <TopExpenses data={summary?.top_expenses || []} />
        )}
      </div>
    </div>
  )
}
