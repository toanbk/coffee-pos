from pydantic import BaseModel
from datetime import datetime

class OrderResponse(BaseModel):
    id: int
    order_date: datetime
    total_quantity: int
    total_amount: float
    customer_name: str | None = None
    payment_method_name: str | None = None

    class Config:
        orm_mode = True 