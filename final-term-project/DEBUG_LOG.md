# บันทึกการไล่ปัญหา (Debug Log) — T15 Print Jobs

บันทึกบั๊กจาก API ของ Print Jobs โดยระบุอาการ วิธีทำซ้ำ เครื่องมือ สาเหตุ วิธีแก้ และ Regression Test

## BUG #1 — POST รับจำนวนหน้าเป็นทศนิยม

- **อาการ:** API สร้าง Print Job อาจยอมรับ `pages` ที่เป็นทศนิยม เช่น `1.5` ทั้งที่จำนวนหน้าควรเป็นจำนวนเต็ม
- **วิธีทำซ้ำ:** ส่ง `POST /api/print-jobs` ด้วยข้อมูลที่ถูกต้องทุกช่อง แต่กำหนด `pages: 1.5`
- **เครื่องมือ:** Vitest integration test และ HTTP request ไปยัง API
- **สาเหตุ:** `api/src/server.js` เดิมตรวจเพียงช่วงค่าของ `pages` และ `copies` แต่ไม่ได้เรียกตัวตรวจสอบ `validateCreatePrintJob()` ซึ่งมีเงื่อนไขตรวจจำนวนเต็มอยู่แล้ว
- **วิธีแก้:** เรียก `validateCreatePrintJob(req.body)` ก่อนบันทึก Print Job และส่ง HTTP 400 เมื่อข้อมูลไม่ผ่าน validation
- **Regression Test:** `api/tests/integration/print-jobs.integration.test.js` — `rejects decimal pages`
- **ผลหลังแก้:** Regression Test ผ่าน และชุด API tests ผ่าน 35/35

## BUG #2 — PUT ยอมรับสถานะว่าง

- **อาการ:** Staff สามารถส่ง `PUT /api/print-jobs/:id` ด้วย `status: ""` ได้โดยไม่มีการตรวจสอบค่าว่างก่อนอัปเดตฐานข้อมูล
- **วิธีทำซ้ำ:** ส่ง PUT ด้วย Staff token และ JSON body `{"status":""}` สำหรับ Print Job ที่มีอยู่
- **เครื่องมือ:** Vitest integration test และตรวจสอบสถานะของรายการผ่าน GET ก่อนและหลัง PUT
- **สาเหตุ:** `api/src/server.js` เดิมอ่าน `status` จาก request body แล้วส่งค่าไปยังคำสั่ง UPDATE โดยตรง โดยไม่มีการตรวจชนิดข้อมูลหรือข้อความว่าง
- **วิธีแก้:** ตรวจว่า `status` เป็น string และหลัง trim แล้วต้องไม่ว่าง หากไม่ผ่านให้ตอบ HTTP 400 โดยไม่อัปเดตฐานข้อมูล
- **Regression Test:** `api/tests/integration/print-jobs.integration.test.js` — `rejects empty status and preserves the existing status`
- **ผลหลังแก้:** Regression Test ผ่าน และชุด API tests ผ่าน 35/35
