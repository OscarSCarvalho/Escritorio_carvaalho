import { formatCurrency } from '@/lib/utils'

interface Props {
  data: { description: string; amount: number; category: string }[]
}

export default function TopExpenses({ data }: Props) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-text-secondary">
        <span className="text-3xl mb-2">🏆</span>
        <p className="text-sm">Sem despesas este mês</p>
      </div>
    )
  }

  const max = data[0]?.amount || 1

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-text-secondary text-xs w-5 text-right">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <span className="text-text-primary text-sm font-medium truncate">{item.description}</span>
              <span className="text-text-primary text-sm font-bold ml-2 shrink-0">{formatCurrency(item.amount)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-danger to-warning rounded-full"
                  style={{ width: `${(item.amount / max) * 100}%` }}
                />
              </div>
              <span className="text-text-secondary text-xs shrink-0">{item.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
