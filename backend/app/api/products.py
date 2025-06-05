from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from ..models.models import Product, User
from ..utils.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[dict])
async def get_products(
    category_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Product).filter(Product.is_active == 1)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    products = query.all()
    return [
        {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category_id": product.category_id,
            "image_url": product.image_url
        }
        for product in products
    ]

@router.post("/")
async def create_product(
    name: str,
    description: str,
    price: float,
    category_id: int,
    image_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = Product(
        name=name,
        description=description,
        price=price,
        category_id=category_id,
        image_url=image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"message": "Product created successfully", "id": product.id}

@router.put("/{product_id}")
async def update_product(
    product_id: int,
    name: str,
    description: str,
    price: float,
    category_id: int,
    image_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.name = name
    product.description = description
    product.price = price
    product.category_id = category_id
    product.image_url = image_url
    db.commit()
    return {"message": "Product updated successfully"}

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_active = 0
    db.commit()
    return {"message": "Product deleted successfully"} 