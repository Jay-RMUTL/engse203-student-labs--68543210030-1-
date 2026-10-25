-- 1. ลบตารางเดิมถ้ามี (เพื่อความสะอาดในการรันใหม่)
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS users;

-- 2. สร้างตาราง users (ผู้ใช้งานระบบ)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    fullname TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student'
);

-- 3. สร้างตาราง requests (คำขอรับบริการ เชื่อมกับ users ด้วย Foreign Key)
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'รอดำเนินการ',
    requester_id INTEGER NOT NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. เพิ่มข้อมูลตัวอย่าง (Seed Data) ลงใน users
INSERT INTO users (username, fullname, role) VALUES 
('@john_doe', 'John Doe', 'student'),
('@jane_smith', 'Jane Smith', 'staff'),
('@admin_bob', 'Bob Admin', 'admin');

-- 5. เพิ่มข้อมูลตัวอย่าง (Seed Data) ลงใน requests
INSERT INTO requests (title, category, status, requester_id) VALUES 
('แจ้งซ่อมโปรเจคเตอร์ห้อง Lab 301', 'Hardware', 'รอดำเนินการ', 1),
('ขอสิทธิ์เข้าใช้งานฐานข้อมูลกลาง', 'Network', 'กำลังดำเนินการ', 1),
('ติดตั้งโปรแกรม Node.js เพิ่มเติม', 'Software', 'เสร็จสิ้น', 2);
