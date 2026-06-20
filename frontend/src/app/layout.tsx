import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Escritório Virtual Financeiro | Família Carvalho',
  description: 'Gestão financeira inteligente para a Família Carvalho',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-bg-dark text-text-primary min-h-screen">{children}</body>
    </html>
  )
}
