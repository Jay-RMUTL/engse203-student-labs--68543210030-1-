# Data Model Documentation - Week 09 SQL Fundamentals

เอกสารอธิบายโครงสร้างฐานข้อมูลและความสัมพันธ์ของระบบ Campus Service Request

## 1. ER Diagram & Relations
- **ตาราง `users` (ผู้ใช้งานระบบ)**
  - `id` (INTEGER, PK): รหัสผู้ใช้งาน (Auto-increment)
  - `username` (TEXT, UNIQUE): ชื่อผู้ใช้งาน
  - `fullname` (TEXT): ชื่อ-นามสกุลจริง
  - `role` (TEXT): บทบาทผู้ใช้ (student, staff, admin)

- **ตาราง `requests` (คำขอรับบริการ)**
  - `id` (INTEGER, PK): รหัสคำขอ (Auto-increment)
  - `title` (TEXT): หัวข้อคำขอ
  - `category` (TEXT): หมวดหมู่ (Hardware, Software, Network)
  - `status` (TEXT): สถานะคำขอ (รอดำเนินการ, กำลังดำเนินการ, เสร็จสิ้น)
  - `requester_id` (INTEGER, FK): รหัสผู้ขออ้างอิงไปยัง `users(id)`

## 2. ความสัมพันธ์ (Relationship)
- ความสัมพันธ์แบบ **One-to-Many (1:N)** ระหว่าง `users` และ `requests`
- ผู้ใช้ 1 คน (`users`) สามารถสร้างคำขอรับบริการได้หลายรายการ (`requests`)
- ใช้ Foreign Key `requester_id` เชื่อมโยงพร้อมกำหนด `ON DELETE CASCADE` เพื่อความปลอดภัยของข้อมูล
