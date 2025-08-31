from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from ..models.models import Order, OrderItem, Product, User
from ..utils.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime, timedelta
from ..schemas.order import OrderResponse

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    payment_method_code: str = None

router = APIRouter()

@router.post("")
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        total_amount += product.price * item.quantity
        order_items.append({
            "product_id": item.product_id,
            "product_name": product.name,
            "unit_price": product.price,
            "quantity": item.quantity,
            "price": product.price * item.quantity
        })
    
    # Create order
    order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        payment_method_code=order_data.payment_method_code,
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Create order items
    for item in order_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            product_name=item["product_name"],
            unit_price=item["unit_price"],
            quantity=item["quantity"],
            price=item["price"]
        )
        db.add(order_item)
    
    db.commit()
    return {"message": "Order created successfully", "order_id": order.id}

@router.get("", response_model=List[dict])
async def get_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return [
        {
            "id": order.id,
            "total_amount": order.total_amount,
            "payment_method_code": order.payment_method_code,
            "status": order.status,
            "created_at": order.created_at,
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "unit_price": item.unit_price,
                    "quantity": item.quantity,
                    "price": item.price
                }
                for item in order.items
            ]
        }
        for order in orders
    ]

@router.get("/view/{order_id}")
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "total_amount": order.total_amount,
        "payment_method_code": order.payment_method_code,
        "status": order.status,
        "created_at": order.created_at,
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "price": item.price
            }
            for item in order.items
        ]
    }

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if status not in ["pending", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    order.status = status
    db.commit()
    return {"message": "Order status updated successfully"}

@router.get("/history", response_model=List[OrderResponse])
def get_order_history(
    date_filter: str = Query(..., description="Filter orders by date range"),
    db: Session = Depends(get_db)
):
    today = datetime.now().date()
    if date_filter == "today":
        start_date = today
        end_date = today + timedelta(days=1)
    elif date_filter == "yesterday":
        start_date = today - timedelta(days=1)
        end_date = today
    elif date_filter == "7days":
        start_date = today - timedelta(days=7)
        end_date = today + timedelta(days=1)
    elif date_filter == "14days":
        start_date = today - timedelta(days=14)
        end_date = today + timedelta(days=1)
    elif date_filter == "30days":
        start_date = today - timedelta(days=30)
        end_date = today + timedelta(days=1)
    else:
        raise HTTPException(status_code=400, detail="Invalid date filter")

    orders = db.query(Order).filter(
        Order.created_at >= start_date,
        Order.created_at < end_date
    ).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        total_quantity = sum(item.quantity for item in order.items)
        result.append({
            "id": order.id,
            "order_date": order.created_at,
            "total_quantity": total_quantity,
            "total_amount": float(order.total_amount),
        })
    return result

@router.delete("/delete/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"} 