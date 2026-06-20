'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data: { name: string; value: number; color: string }[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-bg-card border border-border-dark rounded-lg p-3 shadow-xl">
        <p className="text-text-primary font-medium">{payload[0].name}</p>
        <p className="text-primary font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DonutChart({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-sm">Sem dados de despesas</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-text-secondary text-xs">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
