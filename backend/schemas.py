from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ScanBase(BaseModel):
    prediction: str
    confidence: float
    image_url: str

class ScanCreate(ScanBase):
    pass

class Scan(ScanBase):
    id: int
    user_id: int
    timestamp: datetime
    class Config:
        from_attributes = True

class PlanBase(BaseModel):
    prediction: str
    steps: List[str]

class PlanCreate(PlanBase):
    pass

class SavedPlan(PlanBase):
    id: int
    user_id: int
    timestamp: datetime
    class Config:
        from_attributes = True
