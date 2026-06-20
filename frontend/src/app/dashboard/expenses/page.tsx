'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, TrendingDown } from 'lucide-react'
import { api, fetcher } from '@/lib/api'
import { Expense } from '@/types'
import { formatCurrency, formatDate, getCurrentMonth } from '@/lib/utils'
import ExpenseForm from '@/components/expenses/ExpenseForm'

export default function ExpensesPage() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Expense | undefined>()

  const { data: expenses, mutate, isLoading } = useSWR<Expense[]>(
    `/expenses?month=${month}`,
    fetcher<Expense[]>
  )

  const total = expenses?.reduce((s, e) => s + e.amount, 0) || 0

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta despesa?')) return
    await api.delete(`/expenses/${id}`)
    mutate()
  }

  const handleSaved = () => {
    setShowForm(false)
    setEditing(undefined)
    mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center">
            <TrendingDown size={20} className="text-danger" />
          </div>
          <div>
            <p className="text-text-secondary text-xs">Total de despesas</p>
            <p className="text-danger text-xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="bg-bg-card border border-border-dark text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => { setEditing(undefined); setShowForm(true) }}
            className="flex items-center gap-2 bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Nova Despesa
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border-dark rounded-xl p-6">
          <h3 className="text-text-primary font-semibold mb-4">{editing ? 'Editar Despesa' : 'Nova Despesa'}</h3>
          <ExpenseForm initial={editing} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditing(undefined) }} />
        </div>
      )}

      <div className="bg-bg-card border border-border-dark rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse bg-slate-700/30 rounded" />)}
          </div>
        ) : !expenses?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <span className="text-5xl mb-3">💸</span>
            <p className="font-medium">Nenhuma despesa registrada</p>
            <p className="text-sm mt-1">Clique em "Nova Despesa" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  {['Descrição', 'Categoria', 'Data', 'Pagamento', 'Valor', 'Ações'].map(h => (
                    <th key={h} className={`text-text-secondary text-xs font-medium px-4 py-3 ${h === 'Valor' || h === 'Ações' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="border-b border-border-dark/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-text-primary text-sm">{e.description}</span>
                      {e.observation && <p className="text-text-secondary text-xs mt-0.5">{e.observation}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {e.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: e.category.color + '20', color: e.category.color }}>
                          {e.category.icon} {e.category.name}
                        </span>
                      ) : <span className="text-text-secondary text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-700 rounded text-text-secondary text-xs">{e.payment_method}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-danger font-semibold text-sm">{formatCurrency(e.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditing(e); setShowForm(true) }}
                          className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(e.id)}
                          className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
