from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from typing import List
from ..config.database import get_db
from ..models.models import Order, OrderItem, User
from ..utils.auth import get_current_user, require_admin

router = APIRouter()

@router.get("/overview")
async def get_overview_report(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    today = datetime.now().date()
    
    # Get total orders and revenue for today
    result = db.query(
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_amount).label('total_revenue')
    ).filter(
        cast(Order.created_at, Date) == today
    ).first()
    
    return {
        "total_orders": result.total_orders or 0,
        "total_revenue": float(result.total_revenue or 0)
    }

@router.get("/product-revenue")
async def get_product_revenue_report(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    today = datetime.now().date()
    
    # Get revenue by product for today
    results = db.query(
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label('quantity'),
        func.sum(OrderItem.price).label('total_price')
    ).join(
        Order, Order.id == OrderItem.order_id
    ).filter(
        cast(Order.created_at, Date) == today
    ).group_by(
        OrderItem.product_name
    ).all()
    
    return [
        {
            "product_name": r.product_name,
            "quantity": r.quantity,
            "total_price": float(r.total_price)
        }
        for r in results
    ]

@router.get("/daily-revenue")
async def get_daily_revenue_report(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Get last 7 days
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=6)
    
    # Get daily revenue for last 7 days
    results = db.query(
        cast(Order.created_at, Date).label('date'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        cast(Order.created_at, Date) >= start_date,
        cast(Order.created_at, Date) <= end_date
    ).group_by(
        cast(Order.created_at, Date)
    ).all()
    
    # Format dates and ensure all days are included
    daily_data = []
    current_date = start_date
    while current_date <= end_date:
        # Find revenue for current date
        revenue = next(
            (float(r.revenue) for r in results if r.date == current_date),
            0
        )
        
        # Format date as "DD/MM - Day"
        formatted_date = current_date.strftime("%d/%m - %A")
        
        daily_data.append({
            "date": formatted_date,
            "revenue": revenue
        })
        
        current_date += timedelta(days=1)
    
    return daily_data 