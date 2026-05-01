from .products import router as products_router
from .orders import router as orders_router
from .quoter import router as quoter_router
from .inventory import router as inventory_router

__all__ = ["products_router", "orders_router", "quoter_router", "inventory_router"]
