'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Target, PlusCircle, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, fetcher } from '@/lib/api'
import { Goal } from '@/types'
import { formatCurrency } from '@/lib/utils'

const goalSchema = z.object({
  name: z.string().min(1),
  target_amount: z.number({ coerce: true }).positive(),
  deadline: z.string().optional(),
  color: z.string(),
})
type GoalFormData = z.infer<typeof goalSchema>

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false)
  const [addingAmount, setAddingAmount] = useState<Goal | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const { data: goals, mutate } = useSWR<Goal[]>('/goals', fetcher<Goal[]>)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: { color: '#6366f1' },
  })

  const onSubmit = async (data: GoalFormData) => {
    await api.post('/goals', data)
    mutate()
    reset()
    setShowForm(false)
  }

  const handleAddAmount = async () => {
    if (!addingAmount || !addAmount) return
    await api.put(`/goals/${addingAmount.id}/add-amount`, { amount: parseFloat(addAmount) })
    mutate()
    setAddingAmount(null)
    setAddAmount('')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta meta?')) return
    await api.delete(`/goals/${id}`)
    mutate()
  }

  const inputCls = 'w-full bg-slate-900 border border-border-dark rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm'

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border-dark rounded-xl p-6">
          <h3 className="text-text-primary font-semibold mb-4">Nova Meta Financeira</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Nome da Meta</label>
              <input {...register('name')} className={inputCls} placeholder="Ex: Viagem, Carro, Reserva de emergência" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Valor Alvo (R$)</label>
              <input {...register('target_amount', { valueAsNumber: true })} type="number" step="0.01" className={inputCls} placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Prazo</label>
              <input {...register('deadline')} type="date" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Cor</label>
              <input {...register('color')} type="color" className="w-full h-10 bg-slate-900 border border-border-dark rounded-lg cursor-pointer" />
            </div>
            <div className="flex items-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-700 text-text-primary py-2.5 rounded-lg text-sm">Cancelar</button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm">
                {isSubmitting ? 'Salvando...' : 'Criar Meta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {addingAmount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border border-border-dark rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-text-primary font-semibold mb-4">Adicionar valor à meta</h3>
            <p className="text-text-secondary text-sm mb-4">{addingAmount.name}</p>
            <input
              type="number" step="0.01" value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              className={inputCls} placeholder="Valor a adicionar (R$)"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setAddingAmount(null); setAddAmount('') }}
                className="flex-1 bg-slate-700 text-text-primary py-2.5 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleAddAmount}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg text-sm">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!goals?.length ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-text-secondary">
            <Target size={48} className="mb-3 opacity-30" />
            <p className="font-medium">Nenhuma meta cadastrada</p>
            <p className="text-sm mt-1">Crie suas metas para acompanhar seu progresso</p>
          </div>
        ) : goals.map(g => (
          <div key={g.id} className="bg-bg-card border border-border-dark rounded-xl p-5 hover:border-primary/40 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: g.color + '20' }}>
                  <Target size={20} style={{ color: g.color }} />
                </div>
                <div>
                  <p className="text-text-primary font-semibold">{g.name}</p>
                  {g.deadline && (
                    <p className="text-text-secondary text-xs">
                      Prazo: {new Date(g.deadline + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(g.id)}
                className="p-1 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Progresso</span>
                <span className="text-text-primary font-bold">{g.percentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${g.percentage}%`, backgroundColor: g.color }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-secondary">
                <span>{formatCurrency(g.current_amount)}</span>
                <span>{formatCurrency(g.target_amount)}</span>
              </div>
            </div>

            {g.percentage >= 100 ? (
              <div className="text-center py-2 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-medium">
                🎉 Meta atingida!
              </div>
            ) : (
              <button
                onClick={() => setAddingAmount(g)}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-primary/10 text-text-secondary hover:text-primary border border-border-dark hover:border-primary/40 py-2 rounded-lg text-sm transition-all"
              >
                <PlusCircle size={14} /> Adicionar valor
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
