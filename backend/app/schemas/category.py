from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CategoryCreate(BaseModel):
    name: str
    type: str
    color: str = "#6366f1"
    icon: str = "💰"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    type: str
    color: str
    icon: str
    created_at: datetime

    model_config = {"from_attributes": True}
