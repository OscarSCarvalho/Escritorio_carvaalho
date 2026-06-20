from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from datetime import date, datetime
import calendar
from collections import defaultdict
from app.database import get_db
from app.models.revenue import Revenue
from app.models.expense import Expense
from app.models.goal import Goal
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


def _get_month_range(month_str: Optional[str]):
    if month_str:
        year, m = map(int, month_str.split("-"))
    else:
        now = datetime.now()
        year, m = now.year, now.month
    last_day = calendar.monthrange(year, m)[1]
    return date(year, m, 1), date(year, m, last_day)


@router.get("/summary")
def get_summary(
    month: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    start, end = _get_month_range(month)

    revenues = db.query(Revenue).filter(
        Revenue.user_id == current_user.id,
        Revenue.date >= start,
        Revenue.date <= end,
    ).all()

    expenses = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start,
        Expense.date <= end,
    ).all()

    all_revenues = db.query(Revenue).filter(Revenue.user_id == current_user.id).all()
    all_expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()

    monthly_revenue = sum(r.amount for r in revenues)
    monthly_expenses = sum(e.amount for e in expenses)
    monthly_profit = monthly_revenue - monthly_expenses
    accumulated_savings = sum(r.amount for r in all_revenues) - sum(e.amount for e in all_expenses)

    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    monthly_goal = sum(g.target_amount for g in goals) if goals else 0
    goal_percentage = (monthly_revenue / monthly_goal * 100) if monthly_goal > 0 else 0

    category_totals: dict = defaultdict(lambda: {"amount": 0.0, "color": "#6b7280", "name": "Outros"})
    for e in expenses:
        cat_name = e.category.name if e.category else "Outros"
        cat_color = e.category.color if e.category else "#6b7280"
        category_totals[cat_name]["amount"] += e.amount
        category_totals[cat_name]["color"] = cat_color
        category_totals[cat_name]["name"] = cat_name

    expense_categories = []
    for cat_name, info in sorted(category_totals.items(), key=lambda x: -x[1]["amount"]):
        pct = (info["amount"] / monthly_expenses * 100) if monthly_expenses > 0 else 0
        expense_categories.append({
            "name": cat_name,
            "amount": round(info["amount"], 2),
            "percentage": round(pct, 1),
            "color": info["color"],
        })

    top_expenses = sorted(
        [{"description": e.description, "amount": e.amount, "category": e.category.name if e.category else "Outros"} for e in expenses],
        key=lambda x: -x["amount"],
    )[:10]

    return {
        "current_balance": round(accumulated_savings, 2),
        "monthly_revenue": round(monthly_revenue, 2),
        "monthly_expenses": round(monthly_expenses, 2),
        "monthly_profit": round(monthly_profit, 2),
        "accumulated_savings": round(accumulated_savings, 2),
        "monthly_goal": round(monthly_goal, 2),
        "goal_percentage": round(min(goal_percentage, 100), 1),
        "expense_categories": expense_categories,
        "top_expenses": top_expenses,
    }


@router.get("/charts")
def get_charts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now()
    months_data = []
    cumulative = 0.0
    patrimony = []
    cashflow = []

    for i in range(5, -1, -1):
        m = now.month - i
        y = now.year
        while m <= 0:
            m += 12
            y -= 1
        last_day = calendar.monthrange(y, m)[1]
        start = date(y, m, 1)
        end = date(y, m, last_day)
        month_label = f"{start.strftime('%b/%y')}"

        rev = sum(
            r.amount for r in db.query(Revenue).filter(
                Revenue.user_id == current_user.id,
                Revenue.date >= start, Revenue.date <= end
            ).all()
        )
        exp = sum(
            e.amount for e in db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.date >= start, Expense.date <= end
            ).all()
        )
        cumulative += rev - exp
        months_data.append({"month": month_label, "receitas": round(rev, 2), "despesas": round(exp, 2)})
        patrimony.append({"date": f"{y}-{m:02d}", "value": round(cumulative, 2)})
        cashflow.append({"date": f"{y}-{m:02d}", "entradas": round(rev, 2), "saidas": round(exp, 2), "saldo": round(rev - exp, 2)})

    all_expenses = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.user_id == current_user.id
    ).all()
    cat_dist: dict = defaultdict(lambda: {"value": 0.0, "color": "#6b7280"})
    for e in all_expenses:
        cat_name = e.category.name if e.category else "Outros"
        cat_dist[cat_name]["value"] += e.amount
        cat_dist[cat_name]["color"] = e.category.color if e.category else "#6b7280"

    expense_distribution = [
        {"name": k, "value": round(v["value"], 2), "color": v["color"]}
        for k, v in sorted(cat_dist.items(), key=lambda x: -x[1]["value"])
    ]

    return {
        "monthly_comparison": months_data,
        "expense_distribution": expense_distribution,
        "patrimony_evolution": patrimony,
        "cashflow": cashflow,
    }
