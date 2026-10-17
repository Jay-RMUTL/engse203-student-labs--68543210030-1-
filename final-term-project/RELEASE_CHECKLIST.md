# Release Checklist — T15 Print Jobs

## Backend
- [x] API unit tests ผ่านครบ 12 ข้อ
- [x] API integration tests ผ่านครบ 16 ข้อ
- [x] Existing API tests ผ่านครบ 7 ข้อ
- [x] Health endpoint ตรวจสอบฐานข้อมูลได้
- [x] ตรวจสอบ JWT authentication และ Staff authorization
- [x] Production ต้องกำหนด JWT_SECRET ก่อนเริ่มระบบ
- [x] Production ไม่ส่ง stack trace ให้ผู้ใช้
- [x] Staff credentials ใช้ environment variables

## DevOps
- [x] มี GitHub Actions workflow สำหรับ push และ pull_request
- [x] มี api/.env.example โดยไม่ใส่ secret จริง
- [x] render.yaml ตั้งค่าเริ่มระบบสำหรับ Final API
- [x] Render สร้าง JWT_SECRET ด้วย generateValue
- [x] .env อยู่ใน .gitignore

## งานที่ยังรอดำเนินการ
- รออาจารย์อนุมัติก่อน Deploy API ไปยัง Render
- หลัง Deploy ให้ตั้ง STAFF_EMAIL และ STAFF_PASSWORD ใน Render
- หลัง Deploy ให้ตรวจสอบ GET /api/health บน URL จริง
- หลัง Deploy ให้รัน npm run check -- --online
- หลัง Deploy ให้บันทึก Production URL จริงลง README.md
- ตรวจสอบผล CI บน GitHub หลังตั้งค่า Repository

