'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace(isAuthenticated() ? '/dashboard' : '/login')
  }, [router])
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
