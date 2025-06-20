from pydantic import BaseModel
from datetime import date  

class SaleItem(BaseModel):
    OrderDate: date  
    Region: str
    City: str
    Category: str
    Product: str
    Quantity: int
    UnitPrice: float
    TotalPrice: float