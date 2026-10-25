# API Contract - Week 10 SQLite Backend

เอกสารสัญญาการเชื่อมต่อ RESTful API ที่ดึงข้อมูลจาก SQLite Database (`campus.db`)

## Endpoints
- `GET /api/requests` - ดึงข้อมูลทั้งหมด (รวมข้อมูลผู้ใช้ผ่าน JOIN)
- `GET /api/requests/:id` - ดึงข้อมูลตาม ID
- `POST /api/requests` - เพิ่มข้อมูลคำขอใหม่ (รองรับการแปลงชื่อผู้ใช้เป็น ID)
- `PUT /api/requests/:id` - อัปเดตสถานะคำขอ
- `DELETE /api/requests/:id` - ลบข้อมูลคำขอ
