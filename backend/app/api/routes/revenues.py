from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.revenue import Revenue
from app.models.user import User
from app.schemas.revenue import RevenueCreate, RevenueUpdate, RevenueOut
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[RevenueOut])
def list_revenues(
    month: Optional[str] = None,
    start: Optional[date] = None,
    end: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Revenue).options(joinedload(Revenue.category)).filter(
        Revenue.user_id == current_user.id
    )
    if month:
        import calendar
        year, m = map(int, month.split("-"))
        last_day = calendar.monthrange(year, m)[1]
        query = query.filter(
            Revenue.date >= date(year, m, 1),
            Revenue.date <= date(year, m, last_day),
        )
    if start:
        query = query.filter(Revenue.date >= start)
    if end:
        query = query.filter(Revenue.date <= end)
    return query.order_by(Revenue.date.desc()).all()


@router.post("", response_model=RevenueOut, status_code=201)
def create_revenue(
    data: RevenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = Revenue(user_id=current_user.id, **data.model_dump())
    db.add(revenue)
    db.commit()
    db.refresh(revenue)
    return db.query(Revenue).options(joinedload(Revenue.category)).filter(Revenue.id == revenue.id).first()


@router.get("/{revenue_id}", response_model=RevenueOut)
def get_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = db.query(Revenue).options(joinedload(Revenue.category)).filter(
        Revenue.id == revenue_id, Revenue.user_id == current_user.id
    ).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    return revenue


@router.put("/{revenue_id}", response_model=RevenueOut)
def update_revenue(
    revenue_id: int,
    data: RevenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = db.query(Revenue).filter(
        Revenue.id == revenue_id, Revenue.user_id == current_user.id
    ).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(revenue, field, value)
    db.commit()
    return db.query(Revenue).options(joinedload(Revenue.category)).filter(Revenue.id == revenue_id).first()


@router.delete("/{revenue_id}", status_code=204)
def delete_revenue(
    revenue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    revenue = db.query(Revenue).filter(
        Revenue.id == revenue_id, Revenue.user_id == current_user.id
    ).first()
    if not revenue:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    db.delete(revenue)
    db.commit()
