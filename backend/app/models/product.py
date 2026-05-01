from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, func
from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    cost_per_kg = Column(Numeric(10, 2), nullable=False)
    margin_percent = Column(Numeric(5, 2), nullable=False, default=30)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    stock_kg = Column(Numeric(10, 3), nullable=False, default=0)
    stock_alert_threshold = Column(Numeric(10, 3), nullable=False, default=5)
    image_url = Column(Text, nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
