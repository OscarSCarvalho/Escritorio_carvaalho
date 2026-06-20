from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from datetime import datetime, date
import calendar
from collections import defaultdict
from app.database import get_db
from app.models.revenue import Revenue
from app.models.expense import Expense
from app.models.goal import Goal
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


def _month_data(db, user_id, year=None, month=None):
    now = datetime.now()
    y = year or now.year
    m = month or now.month
    last = calendar.monthrange(y, m)[1]
    start = date(y, m, 1)
    end = date(y, m, last)

    revenues = db.query(Revenue).filter(
        Revenue.user_id == user_id, Revenue.date >= start, Revenue.date <= end
    ).all()
    expenses = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.user_id == user_id, Expense.date >= start, Expense.date <= end
    ).all()
    return revenues, expenses


def _format_brl(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


@router.post("/chat")
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = req.message.lower()
    revenues, expenses = _month_data(db, current_user.id)

    total_rev = sum(r.amount for r in revenues)
    total_exp = sum(e.amount for e in expenses)
    profit = total_rev - total_exp

    cat_totals: dict = defaultdict(float)
    for e in expenses:
        cat_name = e.category.name if e.category else "Outros"
        cat_totals[cat_name] += e.amount

    top_cats = sorted(cat_totals.items(), key=lambda x: -x[1])
    top_expenses = sorted(expenses, key=lambda x: -x.amount)[:5]

    now = datetime.now()
    month_name = now.strftime("%B de %Y")

    if any(w in msg for w in ["gastando mais", "maior gasto", "onde gasto", "top gast", "categoria"]):
        if not top_cats:
            response = "Você não possui despesas registradas este mês ainda. Cadastre suas despesas para ver a análise!"
        else:
            lines = [f"📊 **Análise de gastos de {month_name}:**\n"]
            for i, (cat, total) in enumerate(top_cats[:5], 1):
                pct = total / total_exp * 100 if total_exp > 0 else 0
                lines.append(f"{i}. **{cat}**: {_format_brl(total)} ({pct:.1f}%)")
            lines.append(f"\n💡 Sua maior categoria de gasto é **{top_cats[0][0]}** com {_format_brl(top_cats[0][1])}.")
            response = "\n".join(lines)

    elif any(w in msg for w in ["economizar", "economia", "reduzir", "cortar"]):
        if not top_cats:
            response = "Cadastre suas despesas primeiro para que eu possa sugerir como economizar!"
        else:
            lines = [f"💰 **Sugestões de economia para {month_name}:**\n"]
            for cat, total in top_cats[:3]:
                saving = total * 0.15
                lines.append(f"• Reduzir **{cat}** em 15% economizaria {_format_brl(saving)}/mês")
            lines.append(f"\n🎯 Se reduzir essas categorias você pode economizar até {_format_brl(sum(t for _, t in top_cats[:3]) * 0.15)}/mês!")
            response = "\n".join(lines)

    elif any(w in msg for w in ["investir", "investimento", "quanto posso", "sobra"]):
        if profit > 0:
            invest_safe = profit * 0.30
            response = (
                f"💎 **Capacidade de investimento:**\n\n"
                f"• Receitas: {_format_brl(total_rev)}\n"
                f"• Despesas: {_format_brl(total_exp)}\n"
                f"• Sobra do mês: {_format_brl(profit)}\n\n"
                f"🚀 Recomendo investir **30%** do que sobra: {_format_brl(invest_safe)}/mês\n"
                f"Isso representa uma ótima estratégia para construir patrimônio!"
            )
        else:
            response = f"⚠️ Este mês você está com déficit de {_format_brl(abs(profit))}. Antes de investir, foque em equilibrar receitas e despesas."

    elif any(w in msg for w in ["lucro", "resultado", "balanço", "saldo"]):
        emoji = "✅" if profit >= 0 else "❌"
        response = (
            f"{emoji} **Resultado de {month_name}:**\n\n"
            f"• Receitas: {_format_brl(total_rev)}\n"
            f"• Despesas: {_format_brl(total_exp)}\n"
            f"• {'Lucro' if profit >= 0 else 'Prejuízo'}: {_format_brl(abs(profit))}"
        )

    elif any(w in msg for w in ["alimentação", "comida", "mercado", "supermercado"]):
        food_total = cat_totals.get("Alimentação", 0)
        if food_total == 0:
            response = "Não há despesas de Alimentação cadastradas este mês."
        else:
            pct = food_total / total_exp * 100 if total_exp > 0 else 0
            response = (
                f"🍽️ **Gastos com Alimentação em {month_name}:**\n\n"
                f"• Total: {_format_brl(food_total)}\n"
                f"• Representa {pct:.1f}% das suas despesas\n\n"
                f"{'⚠️ Acima do ideal (máx. 25% das despesas). Considere cozinhar mais em casa!' if pct > 25 else '✅ Dentro do recomendado!'}"
            )

    elif any(w in msg for w in ["top", "maiores", "maior"]):
        if not top_expenses:
            response = "Não há despesas cadastradas este mês."
        else:
            lines = [f"🏆 **Top 5 maiores gastos de {month_name}:**\n"]
            for i, e in enumerate(top_expenses, 1):
                lines.append(f"{i}. {e.description}: {_format_brl(e.amount)}")
            response = "\n".join(lines)

    elif any(w in msg for w in ["meta", "goal", "objetivo"]):
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        if not goals:
            response = "Você não possui metas cadastradas. Crie suas metas financeiras na seção **Metas**!"
        else:
            lines = [f"🎯 **Suas metas financeiras:**\n"]
            for g in goals:
                pct = min(100, g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0
                lines.append(f"• **{g.name}**: {_format_brl(g.current_amount)}/{_format_brl(g.target_amount)} ({pct:.1f}%)")
            response = "\n".join(lines)

    elif any(w in msg for w in ["receita", "ganho", "salário", "renda"]):
        response = (
            f"💚 **Receitas de {month_name}:**\n\n"
            f"• Total de receitas: {_format_brl(total_rev)}\n"
            f"• Número de lançamentos: {len(revenues)}\n\n"
            f"{'✅ Boa renda esse mês!' if total_rev > 0 else 'Cadastre suas receitas para ver a análise!'}"
        )

    else:
        response = (
            f"👋 Olá, {current_user.name}! Sou seu assistente financeiro.\n\n"
            f"**Resumo rápido de {month_name}:**\n"
            f"• Receitas: {_format_brl(total_rev)}\n"
            f"• Despesas: {_format_brl(total_exp)}\n"
            f"• {'✅ Lucro' if profit >= 0 else '❌ Prejuízo'}: {_format_brl(abs(profit))}\n\n"
            f"Você pode me perguntar:\n"
            f"• 'Onde estou gastando mais?'\n"
            f"• 'Como posso economizar?'\n"
            f"• 'Quanto posso investir?'\n"
            f"• 'Qual foi meu lucro?'"
        )

    return {"response": response, "data": {"total_revenue": total_rev, "total_expenses": total_exp, "profit": profit}}
