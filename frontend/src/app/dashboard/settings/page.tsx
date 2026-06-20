'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { getUser, removeToken } from '@/lib/auth'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const user = getUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loadingDemo, setLoadingDemo] = useState(false)
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: any) => {
    setSaving(true)
    try {
      if (data.password && data.password !== data.confirmPassword) {
        setMessage('❌ Senhas não conferem')
        return
      }
      setMessage('✅ Perfil atualizado com sucesso!')
    } finally {
      setSaving(false)
    }
  }

  const loadDemoData = async () => {
    setLoadingDemo(true)
    try {
      const today = new Date()
      const m = today.getMonth() + 1
      const y = today.getFullYear()
      const d = (n: number) => `${y}-${String(m).padStart(2, '0')}-${String(n).padStart(2, '0')}`

      const cats = await api.get<any[]>('/categories')
      const expCats = cats.filter((c: any) => c.type === 'expense')
      const revCats = cats.filter((c: any) => c.type === 'revenue')
      const catId = (name: string, list: any[]) => list.find((c: any) => c.name === name)?.id

      await api.post('/revenues', { description: 'Salário', amount: 8000, date: d(5), category_id: catId('Salário', revCats) })
      await api.post('/revenues', { description: 'Freelance Website', amount: 2500, date: d(12), category_id: catId('Freelance', revCats) })
      await api.post('/revenues', { description: 'Rendimentos CDB', amount: 350, date: d(15), category_id: catId('Rendimentos', revCats) })

      await api.post('/expenses', { description: 'Aluguel', amount: 1800, date: d(5), payment_method: 'Transferência', category_id: catId('Moradia', expCats) })
      await api.post('/expenses', { description: 'Supermercado', amount: 650, date: d(8), payment_method: 'Cartão de Débito', category_id: catId('Alimentação', expCats) })
      await api.post('/expenses', { description: 'iFood', amount: 320, date: d(15), payment_method: 'Cartão de Crédito', category_id: catId('Alimentação', expCats) })
      await api.post('/expenses', { description: 'Uber', amount: 180, date: d(20), payment_method: 'PIX', category_id: catId('Transporte', expCats) })
      await api.post('/expenses', { description: 'Plano de Saúde', amount: 450, date: d(10), payment_method: 'Débito Automático', category_id: catId('Saúde', expCats) })
      await api.post('/expenses', { description: 'Netflix + Spotify', amount: 95, date: d(3), payment_method: 'Cartão de Crédito', category_id: catId('Assinaturas', expCats) })
      await api.post('/expenses', { description: 'Curso Online', amount: 297, date: d(18), payment_method: 'Cartão de Crédito', category_id: catId('Educação', expCats) })
      await api.post('/goals', { name: 'Reserva de Emergência', target_amount: 30000, color: '#22c55e' })
      await api.post('/goals', { name: 'Viagem Internacional', target_amount: 15000, color: '#6366f1', deadline: `${y + 1}-06-01` })

      setMessage('✅ Dados de demonstração carregados! Explore o dashboard.')
    } catch {
      setMessage('❌ Erro ao carregar dados de demonstração.')
    } finally {
      setLoadingDemo(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Tem certeza? Isso apagará TODOS seus dados financeiros.')) return
    if (!confirm('Última confirmação: apagar todos os dados?')) return
    removeToken()
    router.push('/login')
  }

  const inputCls = 'w-full bg-slate-900 border border-border-dark rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-primary text-sm'

  return (
    <div className="max-w-2xl space-y-6">
      {message && (
        <div className={`p-3 rounded-lg border text-sm ${message.startsWith('✅') ? 'bg-success/10 border-success/30 text-success' : 'bg-danger/10 border-danger/30 text-danger'}`}>
          {message}
        </div>
      )}

      <div className="bg-bg-card border border-border-dark rounded-xl p-6">
        <h3 className="text-text-primary font-semibold mb-4">👤 Perfil</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Nome</label>
            <input {...register('name')} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input value={user?.email || ''} readOnly className={inputCls + ' opacity-60 cursor-not-allowed'} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Nova senha</label>
            <input {...register('password')} type="password" className={inputCls} placeholder="Deixe vazio para não alterar" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Confirmar nova senha</label>
            <input {...register('confirmPassword')} type="password" className={inputCls} />
          </div>
          <button type="submit" disabled={saving}
            className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>

      <div className="bg-bg-card border border-border-dark rounded-xl p-6">
        <h3 className="text-text-primary font-semibold mb-2">🎮 Dados de Demonstração</h3>
        <p className="text-text-secondary text-sm mb-4">
          Carregue dados fictícios para explorar todas as funcionalidades do sistema.
        </p>
        <button onClick={loadDemoData} disabled={loadingDemo}
          className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          {loadingDemo ? 'Carregando...' : '🚀 Carregar dados de demonstração'}
        </button>
      </div>

      <div className="bg-bg-card border border-danger/30 rounded-xl p-6">
        <h3 className="text-danger font-semibold mb-2">⚠️ Zona de Perigo</h3>
        <p className="text-text-secondary text-sm mb-4">
          Esta ação encerrará sua sessão. Para deletar a conta, entre em contato com o administrador.
        </p>
        <button onClick={handleDeleteAll}
          className="bg-danger hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
          Encerrar sessão
        </button>
      </div>
    </div>
  )
}
