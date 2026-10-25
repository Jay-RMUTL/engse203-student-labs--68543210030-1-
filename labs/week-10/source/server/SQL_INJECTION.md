# SQL Injection Prevention Report - Week 10

การใช้งานไลบรารี `better-sqlite3` ด้วย Prepared Statements (`?` placeholders) ช่วยป้องกันช่องโหว่ SQL Injection ได้อย่างสมบูรณ์ เนื่องจากข้อมูลที่ผู้ใช้กรอกเข้ามาจะถูกมองว่าเป็นค่า Parameter เสมอ ไม่สามารถแทรกคำสั่ง SQL เข้ามาทำงานได้
