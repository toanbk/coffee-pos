from pydantic import BaseModel
from datetime import datetime

class OrderResponse(BaseModel):
    id: int
    order_date: datetime
    total_quantity: int
    total_amount: float

    class Config:
        orm_mode = True 