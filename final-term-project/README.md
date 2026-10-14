# ระบบสั่งพิมพ์งาน (Print Jobs) — ทีม T15

## สมาชิกในทีม
- ปริยากร ธารพรศรี (68543210078-0)
- นรินทร์ ไสวจำเนียรกุล (68543210030-1)

## การติดตั้ง (Installation)
ต้องติดตั้ง Node.js และ npm ก่อน จากนั้นเปิด Terminal ที่โฟลเดอร์โปรเจกต์และรัน:

```powershell
npm install --prefix api
```

## วิธีรันระบบ (How to Run)
รัน API ในโหมดพัฒนา:

```powershell
npm start --prefix api
```

หากต้องการรัน API โดยตรง สามารถใช้คำสั่ง:

```powershell
node api/src/server.js
```

API จะทำงานตามพอร์ตที่กำหนดในโปรเจกต์ หากไม่ได้กำหนดพอร์ต จะใช้ค่าตามโค้ดของเซิร์ฟเวอร์

## วิธีทดสอบ (Testing)
รัน Backend tests ทั้งหมด:

```powershell
npm test --prefix api
```

ตรวจสอบรายการที่ผ่านตามเกณฑ์ของโปรเจกต์:

```powershell
npm run check
```

## บัญชีทดสอบ (Test Accounts)
- **Staff:** `staff@printshop.local` / `password123`
- **Customer:** `user@printshop.local` / `password123`

บัญชีเหล่านี้ใช้สำหรับการทดสอบในเครื่องเท่านั้น ห้ามใช้รหัสผ่านทดสอบเป็นรหัสผ่านจริงใน Production

## API หลัก
- `GET /api/health` — ตรวจสอบสถานะ API และฐานข้อมูล
- `GET /api/print-jobs` — ดูรายการงานพิมพ์
- `GET /api/print-jobs/:id` — ดูงานพิมพ์ตาม ID
- `POST /api/print-jobs` — สร้างงานพิมพ์
- `PUT /api/print-jobs/:id` — แก้ไขสถานะงานพิมพ์ (ต้องใช้ Staff token)
- `DELETE /api/print-jobs/:id` — ลบงานพิมพ์ (ต้องใช้ Staff token)

## การใช้ AI (AI Usage)
ใช้ AI เป็นผู้ช่วยในการออกแบบโครงสร้างโค้ด ตรวจสอบข้อผิดพลาดของสคริปต์ (Debugging) เพิ่ม Regression Tests และเรียบเรียงเอกสารประกอบโปรเจกต์ โดยผู้จัดทำตรวจสอบผลการทำงานด้วยการรันเทสต์ของโปรเจกต์

## การ Deploy
สถานะปัจจุบัน: รออาจารย์อนุมัติก่อน Deploy ไปยัง Render

- **Production URL:** ยังไม่มี เนื่องจากยังไม่ได้รับอนุมัติให้ Deploy
- หลังได้รับอนุมัติ ให้ Deploy API และบันทึก URL จริงให้ตรงกับค่า `deployUrl` ใน `project.config.json`
