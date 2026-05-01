from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import Optional
from ..database import get_db
from ..models.product import Product

router = APIRouter(prefix="/products", tags=["products"])


class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    cost_per_kg: Decimal = Field(..., gt=0)
    margin_percent: Decimal = Field(default=30, ge=0, le=500)
    stock_kg: Decimal = Field(default=0, ge=0)
    stock_alert_threshold: Decimal = Field(default=5, ge=0)
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    cost_per_kg: Optional[Decimal] = None
    margin_percent: Optional[Decimal] = None
    stock_kg: Optional[Decimal] = None
    stock_alert_threshold: Optional[Decimal] = None
    image_url: Optional[str] = None
    active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    cost_per_kg: Decimal
    margin_percent: Decimal
    price_per_kg: Decimal
    stock_kg: Decimal
    stock_alert_threshold: Decimal
    image_url: Optional[str]
    active: bool

    model_config = {"from_attributes": True}


def _compute_price(cost: Decimal, margin: Decimal) -> Decimal:
    return round(cost * (1 + margin / 100), 2)


@router.get("/", response_model=list[ProductResponse])
def list_products(active_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(Product)
    if active_only:
        q = q.filter(Product.active == True)
    return q.all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    price = _compute_price(payload.cost_per_kg, payload.margin_percent)
    product = Product(**payload.model_dump(), price_per_kg=price)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    data = payload.model_dump(exclude_none=True)
    for field, value in data.items():
        setattr(product, field, value)

    if "cost_per_kg" in data or "margin_percent" in data:
        product.price_per_kg = _compute_price(
            Decimal(str(product.cost_per_kg)),
            Decimal(str(product.margin_percent)),
        )

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, logical: bool = True, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if logical:
        product.active = False
        db.commit()
    else:
        db.delete(product)
        db.commit()
