import fs from "fs"
import path from "path"
import Database from "better-sqlite3"

const dbPath = path.resolve("database/campus.db")
const queriesPath = path.resolve("database/queries.sql")

const db = new Database(dbPath)
const queriesSql = fs.readFileSync(queriesPath, "utf8")

// แยกคำสั่ง SQL ด้วยเครื่องหมาย semicolon (;) เพื่อรันทีละคำสั่ง
const statements = queriesSql
  .split(";")
  .map(s => s.trim())
  .filter(s => s.length > 0)

console.log("--- Running queries.sql ---")
statements.forEach((stmt, index) => {
  try {
    console.log(`\nExecuting Query #${index + 1}:`)
    console.log(stmt)
    if (stmt.toUpperCase().startsWith("SELECT")) {
      const rows = db.prepare(stmt).all()
      console.log("Result:", rows)
    } else {
      const info = db.prepare(stmt).run()
      console.log("Execution Result:", info)
    }
  } catch (err) {
    console.error("Error executing query:", err.message)
  }
})
