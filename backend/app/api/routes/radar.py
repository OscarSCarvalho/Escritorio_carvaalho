from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
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


def _format_brl(value: float) -> str:
    return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _month_totals(db, user_id, year, month):
    last = calendar.monthrange(year, month)[1]
    start = date(year, month, 1)
    end = date(year, month, last)
    rev = sum(r.amount for r in db.query(Revenue).filter(
        Revenue.user_id == user_id, Revenue.date >= start, Revenue.date <= end
    ).all())
    expenses = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.user_id == user_id, Expense.date >= start, Expense.date <= end
    ).all()
    exp = sum(e.amount for e in expenses)
    return rev, exp, expenses


@router.get("/analysis")
def get_radar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now()
    y, m = now.year, now.month

    rev, exp, expenses = _month_totals(db, current_user.id, y, m)

    prev_m = m - 1 if m > 1 else 12
    prev_y = y if m > 1 else y - 1
    prev_rev, prev_exp, prev_expenses = _month_totals(db, current_user.id, prev_y, prev_m)

    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()

    score = 0
    expense_ratio = exp / rev if rev > 0 else 1.0
    score += max(0, int((1 - expense_ratio) * 40))

    if goals:
        score += 20

    all_revenues = db.query(Revenue).filter(Revenue.user_id == current_user.id).all()
    rev_sources = len(set(r.category_id for r in all_revenues if r.category_id))
    score += min(20, rev_sources * 5)

    if prev_exp > 0:
        exp_var = abs(exp - prev_exp) / prev_exp
        score += max(0, int((1 - exp_var) * 20))
    else:
        score += 15

    score = min(100, max(0, score))

    if score >= 90:
        score_label, score_color = "Excelente", "#22c55e"
    elif score >= 80:
        score_label, score_color = "Muito Bom", "#84cc16"
    elif score >= 70:
        score_label, score_color = "Bom", "#eab308"
    elif score >= 50:
        score_label, score_color = "Regular", "#f97316"
    else:
        score_label, score_color = "Atenção", "#ef4444"

    alerts = []

    cat_totals: dict = defaultdict(float)
    for e in expenses:
        cat_name = e.category.name if e.category else "Outros"
        cat_totals[cat_name] += e.amount

    prev_cat_totals: dict = defaultdict(float)
    for e in prev_expenses:
        cat_name = e.category.name if e.category else "Outros"
        prev_cat_totals[cat_name] += e.amount

    for cat, total in cat_totals.items():
        if exp > 0:
            pct = total / exp * 100
            if pct > 35:
                alerts.append({
                    "type": "warning",
                    "title": f"Alto gasto em {cat}",
                    "description": f"Você gastou {_format_brl(total)} em {cat}, representando {pct:.1f}% das suas despesas.",
                    "icon": "⚠️",
                })

    anomalies = []
    for cat, total in cat_totals.items():
        prev_total = prev_cat_totals.get(cat, 0)
        if prev_total > 0:
            increase = (total - prev_total) / prev_total * 100
            if increase > 30:
                anomalies.append({
                    "category": cat,
                    "current": round(total, 2),
                    "average": round(prev_total, 2),
                    "increase_percent": round(increase, 1),
                })
                alerts.append({
                    "type": "danger",
                    "title": f"Aumento em {cat}",
                    "description": f"Seus gastos com {cat} aumentaram {increase:.0f}% em relação ao mês anterior.",
                    "icon": "📈",
                })

    if rev == 0:
        alerts.append({
            "type": "danger",
            "title": "Sem receitas registradas",
            "description": "Você não possui receitas cadastradas neste mês. Registre seus ganhos!",
            "icon": "💰",
        })

    if exp > rev and rev > 0:
        deficit = exp - rev
        alerts.append({
            "type": "danger",
            "title": "Despesas superam receitas",
            "description": f"Você está gastando {_format_brl(deficit)} a mais do que ganha este mês.",
            "icon": "❌",
        })

    if not alerts:
        alerts.append({
            "type": "info",
            "title": "Finanças sob controle!",
            "description": "Seus gastos estão dentro do padrão normal. Continue assim!",
            "icon": "✅",
        })

    subscription_total = cat_totals.get("Assinaturas", 0)
    waste_detection = []
    if subscription_total > 200:
        waste_detection.append({
            "category": "Assinaturas",
            "amount": round(subscription_total, 2),
            "suggestion": "Revise suas assinaturas e cancele as pouco utilizadas para economizar.",
        })

    food_total = cat_totals.get("Alimentação", 0)
    if food_total > 0 and exp > 0 and (food_total / exp) > 0.3:
        waste_detection.append({
            "category": "Alimentação",
            "amount": round(food_total, 2),
            "suggestion": "Considere cozinhar mais em casa e reduzir deliveries para economizar.",
        })

    next_month_balance = rev - exp
    savings_potential = sum(e["amount"] for e in waste_detection) * 0.3

    return {
        "financial_score": score,
        "score_label": score_label,
        "score_color": score_color,
        "alerts": alerts,
        "predictions": {
            "next_month_balance": round(next_month_balance, 2),
            "savings_potential": round(savings_potential, 2),
        },
        "waste_detection": waste_detection,
        "anomalies": anomalies,
    }
