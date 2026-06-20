'use client'
import useSWR from 'swr'
import { AlertTriangle, CheckCircle, Info, XCircle, TrendingDown, Zap } from 'lucide-react'
import { fetcher } from '@/lib/api'
import { RadarAnalysis } from '@/types'
import { formatCurrency } from '@/lib/utils'

const AlertIcon = ({ type }: { type: string }) => {
  if (type === 'warning') return <AlertTriangle size={18} className="text-warning" />
  if (type === 'danger') return <XCircle size={18} className="text-danger" />
  if (type === 'info') return <CheckCircle size={18} className="text-success" />
  return <Info size={18} className="text-info" />
}

const alertBg: Record<string, string> = {
  warning: 'border-warning/30 bg-warning/5',
  danger: 'border-danger/30 bg-danger/5',
  info: 'border-success/30 bg-success/5',
}

export default function RadarPage() {
  const { data, isLoading } = useSWR<RadarAnalysis>('/radar/analysis', fetcher<RadarAnalysis>)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 animate-pulse bg-bg-card rounded-xl" />)}
      </div>
    )
  }

  if (!data) return null

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (data.financial_score / 100) * circumference

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-bg-card border border-border-dark rounded-xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-text-primary font-semibold mb-6">Score Financeiro</h3>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={data.score_color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-text-primary">{data.financial_score}</span>
              <span className="text-text-secondary text-xs">/ 100</span>
            </div>
          </div>
          <p className="text-lg font-bold mt-4" style={{ color: data.score_color }}>{data.score_label}</p>
          <p className="text-text-secondary text-xs mt-1 text-center">Baseado nas suas finanças do mês atual</p>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-bg-card border border-border-dark rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-warning" />
              <span className="text-text-secondary text-sm">Saldo Previsto (próx. mês)</span>
            </div>
            <p className={`text-2xl font-bold ${data.predictions.next_month_balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(data.predictions.next_month_balance)}
            </p>
            <p className="text-text-secondary text-xs mt-1">Baseado no padrão atual</p>
          </div>

          <div className="bg-bg-card border border-border-dark rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-success" />
              <span className="text-text-secondary text-sm">Potencial de Economia</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(data.predictions.savings_potential)}</p>
            <p className="text-text-secondary text-xs mt-1">Se seguir as sugestões</p>
          </div>

          {data.anomalies.map((a, i) => (
            <div key={i} className="bg-bg-card border border-danger/30 bg-danger/5 rounded-xl p-4">
              <p className="text-text-primary text-sm font-medium">📈 {a.category}</p>
              <p className="text-danger text-xs mt-1">+{a.increase_percent.toFixed(0)}% vs mês anterior</p>
              <p className="text-text-secondary text-xs">
                {formatCurrency(a.current)} vs {formatCurrency(a.average)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-text-primary font-semibold mb-4">⚠️ Alertas</h3>
        <div className="space-y-3">
          {data.alerts.map((alert, i) => (
            <div key={i} className={`border rounded-xl p-4 flex gap-3 ${alertBg[alert.type] || 'border-border-dark bg-bg-card'}`}>
              <AlertIcon type={alert.type} />
              <div>
                <p className="text-text-primary font-medium text-sm">{alert.title}</p>
                <p className="text-text-secondary text-xs mt-0.5">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.waste_detection.length > 0 && (
        <div>
          <h3 className="text-text-primary font-semibold mb-4">🗑️ Desperdícios Detectados</h3>
          <div className="space-y-3">
            {data.waste_detection.map((w, i) => (
              <div key={i} className="bg-bg-card border border-border-dark rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-text-primary font-medium text-sm">{w.category}</span>
                    <span className="text-danger font-bold text-sm">{formatCurrency(w.amount)}</span>
                  </div>
                  <p className="text-text-secondary text-xs">{w.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
