from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    deadline: Optional[date] = None
    color: str = "#6366f1"


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    deadline: Optional[date] = None
    color: Optional[str] = None


class GoalAddAmount(BaseModel):
    amount: float


class GoalOut(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    deadline: Optional[date]
    color: str
    created_at: datetime
    percentage: float = 0.0

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_percentage(cls, goal):
        data = cls.model_validate(goal)
        if goal.target_amount > 0:
            data.percentage = min(100.0, (goal.current_amount / goal.target_amount) * 100)
        return data
