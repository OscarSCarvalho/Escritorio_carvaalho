from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[ExpenseOut])
def list_expenses(
    month: Optional[str] = None,
    start: Optional[date] = None,
    end: Optional[date] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.user_id == current_user.id
    )
    if month:
        year, m = map(int, month.split("-"))
        import calendar
        last_day = calendar.monthrange(year, m)[1]
        query = query.filter(
            Expense.date >= date(year, m, 1),
            Expense.date <= date(year, m, last_day),
        )
    if start:
        query = query.filter(Expense.date >= start)
    if end:
        query = query.filter(Expense.date <= end)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    return query.order_by(Expense.date.desc()).all()


@router.post("", response_model=ExpenseOut, status_code=201)
def create_expense(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = Expense(user_id=current_user.id, **data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return db.query(Expense).options(joinedload(Expense.category)).filter(Expense.id == expense.id).first()


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).options(joinedload(Expense.category)).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    return db.query(Expense).options(joinedload(Expense.category)).filter(Expense.id == expense_id).first()


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    db.delete(expense)
    db.commit()
