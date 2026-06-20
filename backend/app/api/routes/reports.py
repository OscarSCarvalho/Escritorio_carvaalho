from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime, timedelta
import calendar
from app.database import get_db
from app.models.revenue import Revenue
from app.models.expense import Expense
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


def _period_range(period: str, ref: date):
    if period == "daily":
        return ref, ref
    elif period == "weekly":
        start = ref - timedelta(days=ref.weekday())
        return start, start + timedelta(days=6)
    elif period == "monthly":
        last = calendar.monthrange(ref.year, ref.month)[1]
        return date(ref.year, ref.month, 1), date(ref.year, ref.month, last)
    else:  # annual
        return date(ref.year, 1, 1), date(ref.year, 12, 31)


def _prev_range(period: str, start: date, end: date):
    delta = end - start + timedelta(days=1)
    return start - delta, end - delta


@router.get("/summary")
def get_report(
    period: str = Query("monthly", enum=["daily", "weekly", "monthly", "annual"]),
    reference_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ref = reference_date or date.today()
    start, end = _period_range(period, ref)
    prev_start, prev_end = _prev_range(period, start, end)

    def totals(s, e):
        rev = sum(
            r.amount for r in db.query(Revenue).filter(
                Revenue.user_id == current_user.id,
                Revenue.date >= s, Revenue.date <= e
            ).all()
        )
        exp = sum(
            ex.amount for ex in db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.date >= s, Expense.date <= e
            ).all()
        )
        return rev, exp

    rev, exp = totals(start, end)
    prev_rev, prev_exp = totals(prev_start, prev_end)

    def pct_change(current, previous):
        if previous == 0:
            return None
        return round((current - previous) / previous * 100, 1)

    revenues_list = db.query(Revenue).filter(
        Revenue.user_id == current_user.id,
        Revenue.date >= start, Revenue.date <= end
    ).order_by(Revenue.date.desc()).all()

    expenses_list = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.date >= start, Expense.date <= end
    ).order_by(Expense.date.desc()).all()

    return {
        "period": period,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "revenues": round(rev, 2),
        "expenses": round(exp, 2),
        "profit": round(rev - exp, 2),
        "savings": round(rev - exp, 2),
        "comparison": {
            "revenues_change": pct_change(rev, prev_rev),
            "expenses_change": pct_change(exp, prev_exp),
            "profit_change": pct_change(rev - exp, prev_rev - prev_exp),
        },
        "transactions": {
            "revenues": [
                {"description": r.description, "amount": r.amount, "date": r.date.isoformat()}
                for r in revenues_list
            ],
            "expenses": [
                {"description": e.description, "amount": e.amount, "date": e.date.isoformat(),
                 "payment_method": e.payment_method}
                for e in expenses_list
            ],
        },
    }
