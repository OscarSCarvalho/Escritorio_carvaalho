'use client'
import {
  AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: { date: string; entradas: number; saidas: number; saldo: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border-dark rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-xs mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="text-sm">
            {p.dataKey === 'entradas' ? 'Entradas' : p.dataKey === 'saidas' ? 'Saídas' : 'Saldo'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AreaChart({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
        <span className="text-3xl mb-2">💹</span>
        <p className="text-sm">Sem dados de fluxo de caixa</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReAreaChart data={data}>
        <defs>
          <linearGradient id="entradas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="saidas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="entradas" stroke="#22c55e" strokeWidth={2} fill="url(#entradas)" />
        <Area type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} fill="url(#saidas)" />
      </ReAreaChart>
    </ResponsiveContainer>
  )
}
