'use client'
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: { date: string; value: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border-dark rounded-lg p-3 shadow-xl">
        <p className="text-text-secondary text-xs mb-1">{label}</p>
        <p className="text-primary font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function LineChart({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
        <span className="text-3xl mb-2">📈</span>
        <p className="text-sm">Sem dados de patrimônio</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReLineChart data={data}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone" dataKey="value" stroke="url(#lineGradient)"
          strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  )
}
