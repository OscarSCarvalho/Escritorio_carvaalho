from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from .category import CategoryOut


class RevenueCreate(BaseModel):
    description: str
    category_id: Optional[int] = None
    amount: float
    date: date
    observation: Optional[str] = None


class RevenueUpdate(BaseModel):
    description: Optional[str] = None
    category_id: Optional[int] = None
    amount: Optional[float] = None
    date: Optional[date] = None
    observation: Optional[str] = None


class RevenueOut(BaseModel):
    id: int
    description: str
    category_id: Optional[int]
    category: Optional[CategoryOut]
    amount: float
    date: date
    observation: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
