'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useSWR from 'swr'
import { api, fetcher } from '@/lib/api'
import { Category, Expense } from '@/types'
import { PAYMENT_METHODS } from '@/lib/utils'

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória'),
  category_id: z.string().optional(),
  amount: z.number({ invalid_type_error: 'Valor inválido' }).positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data obrigatória'),
  payment_method: z.string().min(1, 'Forma de pagamento obrigatória'),
  observation: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  initial?: Expense
  onSaved: () => void
  onCancel: () => void
}

export default function ExpenseForm({ initial, onSaved, onCancel }: Props) {
  const { data: categories } = useSWR<Category[]>('/categories?type=expense', fetcher<Category[]>)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: initial?.description || '',
      category_id: initial?.category_id?.toString() || '',
      amount: initial?.amount || undefined,
      date: initial?.date || new Date().toISOString().split('T')[0],
      payment_method: initial?.payment_method || 'PIX',
      observation: initial?.observation || '',
    },
  })

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, category_id: data.category_id ? parseInt(data.category_id) : null }
    if (initial) {
      await api.put(`/expenses/${initial.id}`, payload)
    } else {
      await api.post('/expenses', payload)
    }
    onSaved()
  }

  const inputCls = 'w-full bg-slate-900 border border-border-dark rounded-lg px-4 py-2.5 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary text-sm'
  const labelCls = 'block text-sm text-text-secondary mb-1'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelCls}>Descrição</label>
        <input {...register('description')} className={inputCls} placeholder="Ex: Supermercado" />
        {errors.description && <p className="text-danger text-xs mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Categoria</label>
          <select {...register('category_id')} className={inputCls}>
            <option value="">Sem categoria</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Data</label>
          <input {...register('date')} type="date" className={inputCls} />
          {errors.date && <p className="text-danger text-xs mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Valor (R$)</label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number" step="0.01" min="0"
            className={inputCls} placeholder="0,00"
          />
          {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Forma de Pagamento</label>
          <select {...register('payment_method')} className={inputCls}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Observação</label>
        <textarea {...register('observation')} className={inputCls + ' resize-none'} rows={2} placeholder="Opcional..." />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-text-primary py-2.5 rounded-lg text-sm font-medium transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-danger hover:bg-red-600 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          {isSubmitting ? 'Salvando...' : initial ? 'Atualizar' : 'Salvar Despesa'}
        </button>
      </div>
    </form>
  )
}
