from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from ..models.models import Customer, User
from ..utils.auth import get_current_user
from pydantic import BaseModel

class CustomerCreate(BaseModel):
    customer_name: str
    phone: str = None
    address: str = None
    city: str = None
    sort_order: int = 0

class CustomerUpdate(BaseModel):
    customer_name: str = None
    phone: str = None
    address: str = None
    city: str = None
    sort_order: int = None
    is_active: bool = None

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customers = db.query(Customer).order_by(Customer.sort_order.asc()).all()
    return [
        {
            "id": customer.id,
            "customer_name": customer.customer_name,
            "phone": customer.phone,
            "address": customer.address,
            "city": customer.city,
            "sort_order": customer.sort_order,
            "is_active": customer.is_active,
            "created_at": customer.created_at
        }
        for customer in customers
    ]

@router.get("/active", response_model=List[dict])
async def get_active_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customers = db.query(Customer).filter(Customer.is_active == True).order_by(Customer.sort_order.asc()).all()
    return [
        {
            "id": customer.id,
            "customer_name": customer.customer_name,
            "phone": customer.phone,
            "address": customer.address,
            "city": customer.city,
            "sort_order": customer.sort_order
        }
        for customer in customers
    ]

@router.post("/")
async def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = Customer(
        customer_name=customer_data.customer_name,
        phone=customer_data.phone,
        address=customer_data.address,
        city=customer_data.city,
        sort_order=customer_data.sort_order
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return {"message": "Customer created successfully", "id": customer.id}

@router.put("/{customer_id}")
async def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    if customer_data.customer_name is not None:
        customer.customer_name = customer_data.customer_name
    if customer_data.phone is not None:
        customer.phone = customer_data.phone
    if customer_data.address is not None:
        customer.address = customer_data.address
    if customer_data.city is not None:
        customer.city = customer_data.city
    if customer_data.sort_order is not None:
        customer.sort_order = customer_data.sort_order
    if customer_data.is_active is not None:
        customer.is_active = customer_data.is_active
    
    db.commit()
    return {"message": "Customer updated successfully"}

@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer.is_active = False
    db.commit()
    return {"message": "Customer deactivated successfully"}

@router.put("/{customer_id}/activate")
async def activate_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer.is_active = True
    db.commit()
    return {"message": "Customer activated successfully"}
