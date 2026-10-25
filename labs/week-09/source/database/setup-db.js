import fs from "fs"
import path from "path"
import Database from "better-sqlite3"

const dbPath = path.resolve("database/campus.db")
const schemaPath = path.resolve("database/schema.sql")

// ลบไฟล์ฐานข้อมูลเก่า (ถ้ามี) เพื่อสร้างใหม่สดๆ
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
  console.log("Deleted old campus.db")
}

const db = new Database(dbPath)
const schemaSql = fs.readFileSync(schemaPath, "utf8")

// รันคำสั่ง SQL ทั้งหมดใน schema.sql
db.exec(schemaSql)
console.log("Database campus.db created and seeded successfully! 🎉")
