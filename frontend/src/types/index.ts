export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  type: 'revenue' | 'expense'
  color: string
  icon: string
}

export interface Revenue {
  id: number
  description: string
  category_id: number | null
  category?: Category
  amount: number
  date: string
  observation?: string
  created_at: string
}

export interface Expense {
  id: number
  description: string
  category_id: number | null
  category?: Category
  amount: number
  date: string
  payment_method: string
  observation?: string
  created_at: string
}

export interface Goal {
  id: number
  name: string
  target_amount: number
  current_amount: number
  deadline?: string
  color: string
  percentage: number
  created_at: string
}

export interface DashboardSummary {
  current_balance: number
  monthly_revenue: number
  monthly_expenses: number
  monthly_profit: number
  accumulated_savings: number
  monthly_goal: number
  goal_percentage: number
  expense_categories: { name: string; amount: number; percentage: number; color: string }[]
  top_expenses: { description: string; amount: number; category: string }[]
}

export interface ChartData {
  monthly_comparison: { month: string; receitas: number; despesas: number }[]
  expense_distribution: { name: string; value: number; color: string }[]
  patrimony_evolution: { date: string; value: number }[]
  cashflow: { date: string; entradas: number; saidas: number; saldo: number }[]
}

export interface RadarAnalysis {
  financial_score: number
  score_label: string
  score_color: string
  alerts: { type: string; title: string; description: string; icon: string }[]
  predictions: { next_month_balance: number; savings_potential: number }
  waste_detection: { category: string; amount: number; suggestion: string }[]
  anomalies: { category: string; current: number; average: number; increase_percent: number }[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ReportSummary {
  period: string
  start: string
  end: string
  revenues: number
  expenses: number
  profit: number
  savings: number
  comparison: {
    revenues_change: number | null
    expenses_change: number | null
    profit_change: number | null
  }
  transactions: {
    revenues: { description: string; amount: number; date: string }[]
    expenses: { description: string; amount: number; date: string; payment_method: string }[]
  }
}
