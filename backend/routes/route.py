from fastapi import APIRouter
from fastapi.responses import JSONResponse
import sqlite3

from configs.config import DATABASE_PATH
from models.model import SaleItem  

Router = APIRouter()

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH) 
    conn.row_factory = sqlite3.Row 
    return conn

@Router.get("/api/sales")
def get_all_sales():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM food_sales")
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append(dict(row))

    return JSONResponse(content=result)

@Router.post("/api/sales")
def create_sale(item: SaleItem):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(""" 
        INSERT INTO food_sales 
            (OrderDate, Region, City, Category, Product, Quantity, UnitPrice, TotalPrice)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
        """, (
            item.OrderDate, item.Region, item.City, item.Category,
            item.Product, item.Quantity, item.UnitPrice, item.TotalPrice
    ))
    conn.commit()
    conn.close()
    return {"message": "Sale record added successfully"}


@Router.put("/api/sales/insert/{id}") 
def update_sale(id: int, item: SaleItem) :
    conn = get_db_connection()
    cursor = conn.cursor() 
    cursor.execute(""" 
        UPDATE food_sales SET
            OrderDate = ?, Region =?, City = ?, Category = ?, 
            Product = ?, Quantity = ?, UnitPrice = ? , TotalPrice = ? 
        WHERE id = ?
    """,(
        item.OrderDate, item.Region, item.City, item.Category,
        item.Product, item.Quantity, item.UnitPrice, item.TotalPrice, id    
    ))
    conn.commit()
    conn.close()
    return {"message": f"Sale record {id} updated"}

@Router.delete("/api/sales/delete/{id}")
def delete_sale(id:int) :
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM food_sales WHERE id = ?", (id,)) 
    conn.commit()
    conn.close()
    return {"message": f"Sale record {id} deleted"}

@Router.get("/api/sales/search")
def search_sales(
    search: str = "",
    startDate: str = None,
    endDate: str = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM food_sales WHERE 1=1"
    params = []

    if search:
        query += """
            AND (
                OrderDate LIKE ? OR
                Region LIKE ? OR
                City LIKE ? OR
                Category LIKE ? OR
                Product LIKE ? OR
                CAST(Quantity AS TEXT) LIKE ? OR
                CAST(UnitPrice AS TEXT) LIKE ? OR
                CAST(TotalPrice AS TEXT) LIKE ?
            )
        """
        like_search = f"%{search}%"
        params.extend([like_search]*8)  

    if startDate and endDate:
        query += " AND OrderDate BETWEEN ? AND ?"
        params.extend([startDate, endDate])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for row in rows:
        result.append(dict(row))
        
    return result



