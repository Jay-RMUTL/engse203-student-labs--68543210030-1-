-- 1. PRIMARY KEY & AUTOINCREMENT test (เพิ่มข้อมูลโดยไม่ระบุ id)
INSERT INTO users (username, fullname) VALUES ('@test_user', 'Test User');

-- 2. NOT NULL test (ชื่อผู้ใช้เป็นค่าว่าง จะต้องเกิด Error)
-- INSERT INTO users (username, fullname) VALUES (NULL, 'No Name');

-- 3. UNIQUE test (ชื่อผู้ใช้ซ้ำกัน จะต้องเกิด Error)
-- INSERT INTO users (username, fullname) VALUES ('@john_doe', 'Duplicate John');

-- 4. DEFAULT test (ไม่ระบุ role ระบบจะใส่ "student" ให้เอง)
SELECT username, role FROM users WHERE username = '@test_user';

-- 5. FOREIGN KEY test (ใส่ requester_id ที่ไม่มีอยู่จริงในตาราง users จะต้องเกิด Error)
-- INSERT INTO requests (title, category, requester_id) VALUES ('เทสผิดพลาด', 'Hardware', 9999);
