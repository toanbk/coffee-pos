from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, categories, products, orders, reports
from .models.models import Base
from .config.database import engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Coffee POS API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development frontend
        "http://pos.huongbonmua.com",  # Production frontend (HTTP)
        "https://pos.huongbonmua.com",  # Production frontend (HTTPS)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Range"],
    max_age=1728000,  # 20 days
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Welcome to Coffee POS API"} 