# API Testing Guide - Week 06 Express API

คู่มือการทดสอบ RESTful API สำหรับระบบ Campus Service Request (Express.js)

## Endpoints ทั้งหมด
1. **GET /** - หน้าต้อนรับเซิร์ฟเวอร์
2. **GET /api/requests** - ดึงข้อมูลคำขอรับบริการทั้งหมด
3. **GET /api/requests/:id** - ดึงข้อมูลคำขอตาม ID
4. **POST /api/requests** - เพิ่มข้อมูลคำขอใหม่ (Body: JSON `{"title": "...", "category": "..."}`)
5. **DELETE /api/requests/:id** - ลบข้อมูลคำขอตาม ID

## ตัวอย่างการทดสอบผ่าน Browser / Postman / Thunder Client
- ดึงข้อมูลทั้งหมด: `GET http://localhost:3000/api/requests`
- ดึงข้อมูลเฉพาะ ID: `GET http://localhost:3000/api/requests/1`
- ทดสอบ Error 404: `GET http://localhost:3000/api/requests/999`
