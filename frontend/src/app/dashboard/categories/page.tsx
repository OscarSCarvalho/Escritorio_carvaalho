'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, fetcher } from '@/lib/api'
import { Category } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  type: z.enum(['revenue', 'expense']),
  color: z.string(),
  icon: z.string(),
})
type FormData = z.infer<typeof schema>

export default function CategoriesPage() {
  const [tab, setTab] = useState<'revenue' | 'expense'>('expense')
  const [showForm, setShowForm] = useState(false)
  const { data: categories, mutate } = useSWR<Category[]>('/categories', fetcher<Category[]>)

  const filtered = categories?.filter(c => c.type === tab) || []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', color: '#6366f1', icon: '💡' },
  })

  const onSubmit = async (data: FormData) => {
    await api.post('/categories', data)
    mutate()
    reset()
    setShowForm(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta categoria?')) return
    await api.delete(`/categories/${id}`)
    mutate()
  }

  const inputCls = 'w-full bg-slate-900 border border-border-dark rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['expense', 'revenue'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-primary text-white' : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border-dark'
              }`}>
              {t === 'expense' ? '💸 Despesas' : (
                <span className="inline-flex items-center gap-2">
                  <img src="/carvalho-logo.svg" alt="Carvalho" className="w-5 h-5 object-contain" />
                  Receitas
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-border-dark rounded-xl p-6">
          <h3 className="text-text-primary font-semibold mb-4">Nova Categoria</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-text-secondary mb-1">Nome</label>
              <input {...register('name')} className={inputCls} placeholder="Nome da categoria" />
              {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Tipo</label>
              <select {...register('type')} className={inputCls}>
                <option value="expense">Despesa</option>
                <option value="revenue">Receita</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Ícone</label>
              <input {...register('icon')} className={inputCls} placeholder="Emoji ex: 🏠" />
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
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(cat => (
          <div key={cat.id}
            className="bg-bg-card border border-border-dark rounded-xl p-4 flex flex-col items-center gap-2 group hover:border-primary/40 transition-all relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: cat.color + '20' }}>
              {cat.icon}
            </div>
            <span className="text-text-primary text-sm font-medium text-center">{cat.name}</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            <button onClick={() => handleDelete(cat.id)}
              className="absolute top-2 right-2 p-1 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {!filtered.length && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-text-secondary">
            <span className="text-4xl mb-2">🏷️</span>
            <p className="text-sm">Nenhuma categoria cadastrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
