'use client'
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: { month: string; receitas: number; despesas: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border-dark rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-xs mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="text-sm font-medium">
            {p.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function BarChart({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-sm">Sem dados para exibir</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReBarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Legend formatter={v => <span className="text-text-secondary text-xs capitalize">{v}</span>} />
        <Bar dataKey="receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}
