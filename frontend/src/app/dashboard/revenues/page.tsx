'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react'
import { api, fetcher } from '@/lib/api'
import { Revenue } from '@/types'
import { formatCurrency, formatDate, getCurrentMonth } from '@/lib/utils'
import RevenueForm from '@/components/revenues/RevenueForm'

export default function RevenuesPage() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Revenue | undefined>()

  const { data: revenues, mutate, isLoading } = useSWR<Revenue[]>(
    `/revenues?month=${month}`,
    fetcher<Revenue[]>
  )

  const total = revenues?.reduce((s, r) => s + r.amount, 0) || 0

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta receita?')) return
    await api.delete(`/revenues/${id}`)
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
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-success" />
          </div>
          <div>
            <p className="text-text-secondary text-xs">Total do mês</p>
            <p className="text-success text-xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="bg-bg-card border border-border-dark text-text-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => { setEditing(undefined); setShowForm(true) }}
            className="flex items-center gap-2 bg-success hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Nova Receita
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border-dark rounded-xl p-6">
          <h3 className="text-text-primary font-semibold mb-4">
            {editing ? 'Editar Receita' : 'Nova Receita'}
          </h3>
          <RevenueForm initial={editing} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditing(undefined) }} />
        </div>
      )}

      <div className="bg-bg-card border border-border-dark rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 animate-pulse bg-slate-700/30 rounded" />)}
          </div>
        ) : !revenues?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <img src="/carvalho-logo.svg" alt="Carvalho" className="w-20 h-20 mb-3 object-contain" />
            <p className="font-medium">Nenhuma receita registrada</p>
            <p className="text-sm mt-1">Clique em "Nova Receita" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-dark">
                  <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">Descrição</th>
                  <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">Categoria</th>
                  <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">Data</th>
                  <th className="text-right text-text-secondary text-xs font-medium px-4 py-3">Valor</th>
                  <th className="text-right text-text-secondary text-xs font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {revenues.map(r => (
                  <tr key={r.id} className="border-b border-border-dark/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-text-primary text-sm">{r.description}</span>
                      {r.observation && <p className="text-text-secondary text-xs mt-0.5">{r.observation}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {r.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: r.category.color + '20', color: r.category.color }}>
                          {r.category.icon} {r.category.name}
                        </span>
                      ) : <span className="text-text-secondary text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-right text-success font-semibold text-sm">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditing(r); setShowForm(true) }}
                          className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(r.id)}
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
