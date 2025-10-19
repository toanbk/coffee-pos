from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..config.database import get_db
from ..models.models import Order, OrderItem, Product, User, Customer, PaymentMethod
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
    customer_id: int = None

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
        customer_id=order_data.customer_id,
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
    orders = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.payment_method)
    ).all()
    return [
        {
            "id": order.id,
            "total_amount": order.total_amount,
            "payment_method_code": order.payment_method_code,
            "payment_method_name": order.payment_method.name if order.payment_method else None,
            "customer_id": order.customer_id,
            "customer_name": order.customer.customer_name if order.customer else None,
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
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.payment_method)
    ).filter(
        Order.id == order_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "total_amount": order.total_amount,
        "payment_method_code": order.payment_method_code,
        "payment_method_name": order.payment_method.name if order.payment_method else None,
        "customer_id": order.customer_id,
        "customer_name": order.customer.customer_name if order.customer else None,
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

    orders = db.query(Order, Customer, PaymentMethod).outerjoin(
        Customer, Order.customer_id == Customer.id
    ).outerjoin(
        PaymentMethod, Order.payment_method_code == PaymentMethod.payment_method_code
    ).filter(
        Order.created_at >= start_date,
        Order.created_at < end_date
    ).order_by(Order.created_at.desc()).all()

    result = []
    for order_tuple in orders:
        order, customer, payment_method = order_tuple
        total_quantity = sum(item.quantity for item in order.items)
        
        result.append({
            "id": order.id,
            "order_date": order.created_at,
            "total_quantity": total_quantity,
            "total_amount": float(order.total_amount),
            "customer_name": customer.customer_name if customer else None,
            "payment_method_name": payment_method.name if payment_method else None,
        })
    return result

@router.get("/debug/{order_id}")
def debug_order(order_id: int, db: Session = Depends(get_db)):
    """Debug endpoint to check order data and relationships"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check raw data
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first() if order.customer_id else None
    payment_method = db.query(PaymentMethod).filter(PaymentMethod.payment_method_code == order.payment_method_code).first() if order.payment_method_code else None
    
    return {
        "order_id": order.id,
        "customer_id": order.customer_id,
        "payment_method_code": order.payment_method_code,
        "customer_data": {
            "id": customer.id if customer else None,
            "name": customer.customer_name if customer else None
        } if customer else None,
        "payment_method_data": {
            "code": payment_method.payment_method_code if payment_method else None,
            "name": payment_method.name if payment_method else None
        } if payment_method else None,
        "relationship_customer": order.customer.customer_name if order.customer else None,
        "relationship_payment_method": order.payment_method.name if order.payment_method else None
    }

@router.delete("/delete/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"} 