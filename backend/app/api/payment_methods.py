from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from ..models.models import PaymentMethod, User
from ..utils.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_payment_methods(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment_methods = db.query(PaymentMethod).filter(PaymentMethod.is_active == True).all()
    return [
        {
            "id": method.id,
            "payment_method_code": method.payment_method_code,
            "name": method.name,
            "description": method.description
        }
        for method in payment_methods
    ]

@router.post("/")
async def create_payment_method(
    payment_method_code: str,
    name: str,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if payment method code already exists
    existing_method = db.query(PaymentMethod).filter(PaymentMethod.payment_method_code == payment_method_code).first()
    if existing_method:
        raise HTTPException(status_code=400, detail="Payment method code already exists")
    
    payment_method = PaymentMethod(
        payment_method_code=payment_method_code,
        name=name,
        description=description
    )
    db.add(payment_method)
    db.commit()
    db.refresh(payment_method)
    return {"message": "Payment method created successfully", "id": payment_method.id}

@router.put("/{method_id}")
async def update_payment_method(
    method_id: int,
    payment_method_code: str,
    name: str,
    description: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()
    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    # Check if the new code conflicts with existing ones (excluding current method)
    existing_method = db.query(PaymentMethod).filter(
        PaymentMethod.payment_method_code == payment_method_code,
        PaymentMethod.id != method_id
    ).first()
    if existing_method:
        raise HTTPException(status_code=400, detail="Payment method code already exists")
    
    payment_method.payment_method_code = payment_method_code
    payment_method.name = name
    payment_method.description = description
    db.commit()
    return {"message": "Payment method updated successfully"}

@router.delete("/{method_id}")
async def delete_payment_method(
    method_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment_method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()
    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    payment_method.is_active = False
    db.commit()
    return {"message": "Payment method deleted successfully"}
