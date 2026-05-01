from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from decimal import Decimal
from ..database import get_db
from ..models.product import Product

router = APIRouter(prefix="/inventory", tags=["inventory"])


class StockUpdate(BaseModel):
    stock_kg: Decimal = Field(..., ge=0)


class ThresholdUpdate(BaseModel):
    stock_alert_threshold: Decimal = Field(..., ge=0)


class StockStatus(BaseModel):
    id: int
    name: str
    stock_kg: Decimal
    stock_alert_threshold: Decimal
    status: str  # ok | warning | critical

    model_config = {"from_attributes": True}


def _stock_status(product: Product) -> str:
    stock = float(product.stock_kg)
    threshold = float(product.stock_alert_threshold)
    if stock <= 0:
        return "critical"
    if stock <= threshold:
        return "warning"
    return "ok"


@router.get("/", response_model=list[StockStatus])
def get_inventory(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.active == True).all()
    return [
        StockStatus(
            id=p.id,
            name=p.name,
            stock_kg=p.stock_kg,
            stock_alert_threshold=p.stock_alert_threshold,
            status=_stock_status(p),
        )
        for p in products
    ]


@router.get("/alerts", response_model=list[StockStatus])
def get_alerts(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.active == True).all()
    alerts = [p for p in products if _stock_status(p) in ("warning", "critical")]
    return [
        StockStatus(
            id=p.id,
            name=p.name,
            stock_kg=p.stock_kg,
            stock_alert_threshold=p.stock_alert_threshold,
            status=_stock_status(p),
        )
        for p in alerts
    ]


@router.patch("/{product_id}/stock", response_model=StockStatus)
def update_stock(product_id: int, payload: StockUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.stock_kg = payload.stock_kg
    db.commit()
    db.refresh(product)
    return StockStatus(
        id=product.id,
        name=product.name,
        stock_kg=product.stock_kg,
        stock_alert_threshold=product.stock_alert_threshold,
        status=_stock_status(product),
    )


@router.patch("/{product_id}/threshold", response_model=StockStatus)
def update_threshold(product_id: int, payload: ThresholdUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.stock_alert_threshold = payload.stock_alert_threshold
    db.commit()
    db.refresh(product)
    return StockStatus(
        id=product.id,
        name=product.name,
        stock_kg=product.stock_kg,
        stock_alert_threshold=product.stock_alert_threshold,
        status=_stock_status(product),
    )
