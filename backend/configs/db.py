import pandas as pd
import sqlite3

# อ่านไฟล์ Excel
df = pd.read_excel('Food sales.xlsx')
df['OrderDate'] = pd.to_datetime(df['OrderDate']).dt.date

# เชื่อมต่อ SQLite
conn = sqlite3.connect('mydatabase.db')
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS food_sales")

columns = df.columns.tolist()
column_defs = ''
for col in columns:
    if col == 'OrderDate':
        column_defs += f'"{col}" DATE, '
    elif col == 'Quantity' :
        column_defs += f'"{col}" INTEGER, '    
    elif col == 'UnitPrice' :
        column_defs += f'"{col}" REAL, '    
    elif col == 'TotalPrice' :
        column_defs += f'"{col}" REAL, '    
    else:
        column_defs += f'"{col}" TEXT, '
column_defs = column_defs.rstrip(', ')

create_table_sql = f'''
    CREATE TABLE food_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        {column_defs}
    )
'''
cursor.execute(create_table_sql)

df.to_sql('food_sales', conn, if_exists='append', index=False)

conn.commit()
conn.close()
