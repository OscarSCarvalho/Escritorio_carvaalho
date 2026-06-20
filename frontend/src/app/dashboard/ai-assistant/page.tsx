'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { api } from '@/lib/api'
import { ChatMessage } from '@/types'

const SUGGESTIONS = [
  'Onde estou gastando mais?',
  'Como economizar este mês?',
  'Quanto posso investir?',
  'Qual foi meu lucro este mês?',
  'Top 5 maiores gastos',
  'Quanto gastei em alimentação?',
  'Quais são minhas metas?',
  'Qual meu saldo atual?',
]

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: '👋 Olá! Sou seu **Assistente Financeiro IA**.\n\nPosso analisar seus dados e responder perguntas sobre suas finanças. Experimente uma das sugestões abaixo ou me faça uma pergunta!',
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await api.post<{ response: string }>('/ai/chat', { message: text })
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro ao processar sua pergunta. Tente novamente.' }])
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-full text-xs transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-success text-white'
            }`}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-bg-card border border-border-dark text-text-primary rounded-tl-none'
                : 'bg-primary text-white rounded-tr-none'
            }`}
              dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-bg-card border border-border-dark rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); sendMessage(input) }}
        className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pergunte algo sobre suas finanças..."
          className="flex-1 bg-bg-card border border-border-dark rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary text-sm"
        />
        <button type="submit" disabled={!input.trim() || loading}
          className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
