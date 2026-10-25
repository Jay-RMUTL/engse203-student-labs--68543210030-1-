# ENGSE203 - Week 11 Fullstack Integration & Production

ระบบจัดการคำขอรับบริการ (Campus Service Request System) แบบ Full-stack เชื่อมต่อ SQLite และพร้อม Deploy บน Production

## สถาปัตยกรรมระบบ
- **Backend:** Node.js + Express + Better-SQLite3
- **Database:** SQLite (`campus.db`) พร้อม Relational Schema (Users & Requests)
- **Environment:** จัดการ Config ผ่าน `.env` และมี Health Check Endpoint (`/api/health`)

## วิธีการรันระบบ
1. ติดตั้งแพ็กเกจ: `npm install`
2. เริ่มต้นรันเซิร์ฟเวอร์: `node server.js`
