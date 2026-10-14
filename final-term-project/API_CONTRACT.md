# API Contract — T15 ระบบสั่งพิมพ์งาน

## Resources

### 1. Print Shops (`/api/print-shops`)
- `GET /api/print-shops` — ดึงรายการสาขาจุดบริการทั้งหมด
- `GET /api/print-shops/:id` — ดึงข้อมูลจุดบริการเฉพาะเจาะจง

### 2. Print Jobs (`/api/print-jobs`)
- `GET /api/print-jobs` — ดึงรายการคำสั่งพิมพ์งานทั้งหมด (กรองด้วย `?status=` ได้)
- `GET /api/print-jobs/:id` — ดึงรายละเอียดคำสั่งพิมพ์งานตาม ID
- `POST /api/print-jobs` — สร้างคำสั่งพิมพ์งานใหม่ (กฎ: จำนวนหน้า 1-200, จำนวนชุด 1-20)[cite: 2]
- `PUT /api/print-jobs/:id` — อัปเดตสถานะงานพิมพ์ (เฉพาะเจ้าหน้าที่: `queued` → `printing` → `ready` → `picked-up`)[cite: 2]
- `DELETE /api/print-jobs/:id` — ลบหรือยกเลิกคำสั่งพิมพ์งาน (เฉพาะเจ้าหน้าที่)