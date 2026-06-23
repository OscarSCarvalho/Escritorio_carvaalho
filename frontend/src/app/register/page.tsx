'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { api } from '@/lib/api'
import { setToken, setUser } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      const res = await api.post<{ access_token: string; user: any }>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setToken(res.access_token)
      setUser(res.user)
      router.push('/dashboard')
    } catch (e: any) {
      setError(e.message || 'Erro ao criar conta')
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-bg-dark to-primary/10 pointer-events-none" />
      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <img src="/carvalho-logo.png" alt="Carvalho" className="mx-auto mb-3 w-20 h-20 object-contain" />
          <h1 className="text-2xl font-bold text-text-primary">Escritório Virtual</h1>
          <p className="text-text-secondary mt-1">Família Carvalho</p>
        </div>

        <div className="bg-bg-card border border-border-dark rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Criar conta</h2>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'seu@email.com' },
              { name: 'password', label: 'Senha', type: 'password', placeholder: '••••••••' },
              { name: 'confirmPassword', label: 'Confirmar senha', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm text-text-secondary mb-1">{field.label}</label>
                <input
                  {...register(field.name as keyof FormData)}
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-900 border border-border-dark rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                />
                {errors[field.name as keyof FormData] && (
                  <p className="text-danger text-xs mt-1">
                    {errors[field.name as keyof FormData]?.message}
                  </p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors mt-2"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
