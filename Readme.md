# Food Sales Manager

เว็บแอปสำหรับจัดการข้อมูลยอดขายอาหาร โดยมีระบบ Frontend, Backend และ Database ที่เชื่อมต่อกัน

## รายละเอียดโปรเจกต์

- **Frontend:** หน้าเว็บแสดงข้อมูลยอดขาย และฟอร์มสำหรับเพิ่ม แก้ไข ลบ ค้นหา และเรียงข้อมูล
- **Backend:** RESTful API ด้วย FastAPI เชื่อมต่อ SQLite database
- **Database:** SQLite สร้างจากไฟล์ Excel `Food sales.xlsx` โดยสคริปต์ Python ใช้ pandas*

## โครงสร้างโปรเจกต์
```
.
├── frontend
│   ├── index.html        # หน้าเว็บหลัก
│   ├── script.js         # สคริปต์ JavaScript ควบคุม UI และเรียก API
│   └── style.css         # ไฟล์ CSS สำหรับตกแต่งหน้าเว็บ
├── backend
│   ├── main.py           # สร้าง FastAPI app และตั้งค่า CORS
│   ├── routes
│   │   └── route.py      # กำหนด API endpoints (CRUD + Search)
│   ├── model
│   │   └── model.py      # Pydantic model สำหรับ validate ข้อมูล
│   └── configs
│       ├── config.py     	 # กำหนด path ฐานข้อมูล SQLite
│       ├── db.py         	 # สคริปต์สร้างฐานข้อมูล SQLite จาก Excel
│       ├── Food sales.xlsx  # ข้อมูลยอดขายต้นทาง
│       └── mydatabase.db    # ฐานข้อมูล SQLite ที่สร้างขึ้น (หลังรัน db.py)

```
## วิธีใช้งาน

### เตรียมฐานข้อมูล

ติดตั้ง Python ไลบรารีทั้งหมดจากไฟล์ `requirements.txt` (อยู่ในโฟลเดอร์ backend):

```bash
pip install -r requirements.txt

```

 รันสคริปต์สร้างฐานข้อมูล (ในโฟลเดอร์ `configs/`):

```bash
python db.py
```
    จะสร้างไฟล์ `mydatabase.db` และตาราง `food_sales` พร้อมข้อมูลจาก `Food sales.xlsx`



### รัน Backend
1. ไปที่โฟลเดอร์ backend

2. รัน FastAPI server:

```bash
uvicorn main:app --reload
```
3. API จะพร้อมใช้งานที่ `http://127.0.0.1:8000`

---

### รัน Frontend
1. เปิดไฟล์ `frontend/index.html` ด้วยเบราว์เซอร์
2. เว็บจะโหลดข้อมูลยอดขายจาก backend อัตโนมัติ
3. ใช้ฟีเจอร์ต่าง ๆ เช่น
   - ค้นหาข้อมูลโดยชื่อ และช่วงวันที่
   - คลิกหัวตารางเพื่อเรียงข้อมูล
   - เพิ่ม แก้ไข ลบ รายการขาย

---


## API Endpoints

| Method | Path                      | รายละเอียด                          |
|--------|---------------------------|------------------------------------|
| GET    | `/api/sales`              | ดึงข้อมูลยอดขายทั้งหมด             |
| POST   | `/api/sales`              | เพิ่มข้อมูลยอดขายใหม่              |
| PUT    | `/api/sales/insert/{id}`  | แก้ไขข้อมูลยอดขายตาม `id`         |
| DELETE | `/api/sales/delete/{id}`  | ลบข้อมูลยอดขายตาม `id`            |
| GET    | `/api/sales/search`       | ค้นหาข้อมูลโดยคำค้นหาและช่วงวันที่  |

---


