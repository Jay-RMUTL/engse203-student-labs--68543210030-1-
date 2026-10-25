-- ข้อ 1: ดึงข้อมูลผู้ใช้ทั้งหมด
SELECT * FROM users;

-- ข้อ 2: ดึงข้อมูลคำขอรับบริการทั้งหมด พร้อมชื่อผู้ขอ (JOIN)
SELECT requests.id, requests.title, requests.category, requests.status, users.fullname AS requester_name
FROM requests
JOIN users ON requests.requester_id = users.id;

-- ข้อ 3: ค้นหาคำขอที่มี category เป็น "Hardware"
SELECT * FROM requests WHERE category = 'Hardware';

-- ข้อ 4: นับจำนวนคำขอทั้งหมดในแต่ละสถานะ (GROUP BY)
SELECT status, COUNT(*) AS total FROM requests GROUP BY status;

-- ข้อ 5: ดึงคำขอที่เรียงลำดับตาม ID จากมากไปน้อย (ORDER BY)
SELECT * FROM requests ORDER BY id DESC;

-- ข้อ 6: เพิ่มคำขอใหม่ (INSERT)
INSERT INTO requests (title, category, status, requester_id) 
VALUES ('พิมพ์เอกสารประกอบการประชุม', 'Software', 'รอดำเนินการ', 2);

-- ข้อ 7: อัปเดตสถานะคำขอ (UPDATE)
UPDATE requests SET status = 'เสร็จสิ้น' WHERE id = 1;

-- ข้อ 8: ลบคำขอตาม ID (DELETE)
DELETE FROM requests WHERE id = 3;
