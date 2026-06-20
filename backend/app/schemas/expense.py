from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from .category import CategoryOut


class ExpenseCreate(BaseModel):
    description: str
    category_id: Optional[int] = None
    amount: float
    date: date
    payment_method: str = "PIX"
    observation: Optional[str] = None


class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    date: Optional[date] = None
    payment_method: Optional[str] = None
    observation: Optional[str] = None


class ExpenseOut(BaseModel):
    id: int
    description: str
    category_id: Optional[int]
    category: Optional[CategoryOut]
    amount: float
    date: date
    payment_method: str
    observation: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
