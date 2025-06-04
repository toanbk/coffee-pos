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

@router.get("/monthly-revenue")
async def get_monthly_revenue_report(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    today = datetime.now().date()
    # Get the first day of the current month
    first_day_this_month = today.replace(day=1)
    # Get the first day of the previous month
    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1)
    # Get the first day of the month before last
    first_day_2_months_ago = (first_day_last_month - timedelta(days=1)).replace(day=1)
    # Get the first day of the next month
    if first_day_this_month.month == 12:
        first_day_next_month = first_day_this_month.replace(year=first_day_this_month.year + 1, month=1, day=1)
    else:
        first_day_next_month = first_day_this_month.replace(month=first_day_this_month.month + 1, day=1)

    # For query, get all orders from first_day_2_months_ago to today
    results = db.query(
        func.extract('year', Order.created_at).label('year'),
        func.extract('month', Order.created_at).label('month'),
        func.sum(Order.total_amount).label('revenue')
    ).filter(
        cast(Order.created_at, Date) >= first_day_2_months_ago,
        cast(Order.created_at, Date) <= today
    ).group_by(
        func.extract('year', Order.created_at),
        func.extract('month', Order.created_at)
    ).order_by(
        func.extract('year', Order.created_at),
        func.extract('month', Order.created_at)
    ).all()

    # Build a list for the last 3 months, current month, and next month
    months = [first_day_2_months_ago, first_day_last_month, first_day_this_month, first_day_next_month]

    monthly_data = []
    for month_date in months:
        year = month_date.year
        month = month_date.month
        # Find revenue for this month
        revenue = next((float(r.revenue) for r in results if int(r.year) == year and int(r.month) == month), 0)
        # For next month (future), always 0
        if month_date == first_day_next_month:
            revenue = 0
        monthly_data.append({
            "month": f"{month:02d}/{year}",
            "revenue": revenue
        })

    return monthly_data 