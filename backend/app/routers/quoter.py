from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from decimal import Decimal
from ..database import get_db
from ..models.product import Product

router = APIRouter(prefix="/quoter", tags=["quoter"])


class QuoteRequest(BaseModel):
    cost_per_kg: Decimal = Field(..., gt=0)
    margin_percent: Decimal = Field(..., ge=0, le=500)


class QuoteResponse(BaseModel):
    cost_per_kg: Decimal
    margin_percent: Decimal
    price_per_kg: Decimal
    profit_per_kg: Decimal


class MixItem(BaseModel):
    product_id: int
    weight_kg: Decimal = Field(..., gt=0)


class MixQuoteRequest(BaseModel):
    items: list[MixItem]


class MixQuoteResponse(BaseModel):
    items: list[dict]
    total_cost: Decimal
    total_price: Decimal
    total_profit: Decimal
    is_profitable: bool


@router.post("/calculate", response_model=QuoteResponse)
def calculate_price(payload: QuoteRequest):
    price = payload.cost_per_kg * (1 + payload.margin_percent / 100)
    profit = price - payload.cost_per_kg
    return QuoteResponse(
        cost_per_kg=payload.cost_per_kg,
        margin_percent=payload.margin_percent,
        price_per_kg=round(price, 2),
        profit_per_kg=round(profit, 2),
    )


@router.post("/mix", response_model=MixQuoteResponse)
def quote_mix(payload: MixQuoteRequest, db: Session = Depends(get_db)):
    items_result = []
    total_cost = Decimal("0")
    total_price = Decimal("0")

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.active == True).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")

        subtotal_cost = Decimal(str(product.cost_per_kg)) * item.weight_kg
        subtotal_price = Decimal(str(product.price_per_kg)) * item.weight_kg

        items_result.append({
            "product_id": product.id,
            "product_name": product.name,
            "weight_kg": item.weight_kg,
            "price_per_kg": product.price_per_kg,
            "subtotal": round(subtotal_price, 2),
        })

        total_cost += subtotal_cost
        total_price += subtotal_price

    total_profit = total_price - total_cost
    return MixQuoteResponse(
        items=items_result,
        total_cost=round(total_cost, 2),
        total_price=round(total_price, 2),
        total_profit=round(total_profit, 2),
        is_profitable=total_profit > 0,
    )


@router.patch("/products/{product_id}/margin", response_model=dict)
def update_margin(product_id: int, margin_percent: Decimal, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    product.margin_percent = margin_percent
    product.price_per_kg = Decimal(str(product.cost_per_kg)) * (1 + margin_percent / 100)
    db.commit()
    db.refresh(product)

    return {
        "product_id": product.id,
        "name": product.name,
        "cost_per_kg": product.cost_per_kg,
        "margin_percent": product.margin_percent,
        "price_per_kg": product.price_per_kg,
    }
