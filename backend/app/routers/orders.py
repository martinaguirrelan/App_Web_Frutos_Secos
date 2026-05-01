from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from typing import Optional
from datetime import datetime
from ..database import get_db
from ..models.order import Order
from ..models.order_item import OrderItem
from ..models.product import Product

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_STATUSES = {"pending", "in_transit", "delivered"}


class OrderItemIn(BaseModel):
    product_id: int
    weight_kg: Decimal


class OrderCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    items: list[OrderItemIn]


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    weight_kg: Decimal
    unit_price_per_kg: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    status: str
    customer_name: Optional[str]
    customer_email: Optional[str]
    customer_phone: Optional[str]
    notes: Optional[str]
    total_price: Decimal
    created_at: datetime
    delivered_at: Optional[datetime]
    items: list[OrderItemResponse]

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[OrderResponse])
def list_orders(
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Order)
    if status:
        q = q.filter(Order.status == status)
    if date_from:
        q = q.filter(Order.created_at >= date_from)
    if date_to:
        q = q.filter(Order.created_at <= date_to)
    return q.order_by(Order.created_at.desc()).all()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    total = Decimal("0")
    items_data = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.active == True).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Producto {item.product_id} no encontrado")
        if float(product.stock_kg) < float(item.weight_kg):
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {product.name}")

        subtotal = Decimal(str(product.price_per_kg)) * item.weight_kg
        total += subtotal
        items_data.append({
            "product": product,
            "weight_kg": item.weight_kg,
            "unit_price_per_kg": product.price_per_kg,
            "subtotal": round(subtotal, 2),
        })

    order = Order(
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        customer_phone=payload.customer_phone,
        notes=payload.notes,
        total_price=round(total, 2),
    )
    db.add(order)
    db.flush()

    for item_data in items_data:
        db.add(OrderItem(
            order_id=order.id,
            product_id=item_data["product"].id,
            weight_kg=item_data["weight_kg"],
            unit_price_per_kg=item_data["unit_price_per_kg"],
            subtotal=item_data["subtotal"],
        ))
        item_data["product"].stock_kg = Decimal(str(item_data["product"].stock_kg)) - item_data["weight_kg"]

    db.commit()
    db.refresh(order)
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_status(order_id: int, new_status: str = Query(...), db: Session = Depends(get_db)):
    if new_status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Válidos: {VALID_STATUSES}")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    order.status = new_status
    if new_status == "delivered":
        order.delivered_at = func.now()

    db.commit()
    db.refresh(order)
    return order
