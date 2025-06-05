from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from ..models.models import Category, User
from ..utils.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[dict])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Category).filter(Category.is_active == 1).all()
    return [
        {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "image_url": category.image_url
        }
        for category in categories
    ]

@router.post("/")
async def create_category(
    name: str,
    description: str,
    image_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = Category(
        name=name,
        description=description,
        image_url=image_url
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"message": "Category created successfully", "id": category.id}

@router.put("/{category_id}")
async def update_category(
    category_id: int,
    name: str,
    description: str,
    image_url: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.name = name
    category.description = description
    category.image_url = image_url
    db.commit()
    return {"message": "Category updated successfully"}

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.is_active = 0
    db.commit()
    return {"message": "Category deleted successfully"} 