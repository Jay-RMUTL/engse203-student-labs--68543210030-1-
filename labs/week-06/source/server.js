import express from "express"
import cors from "cors"
import requestRoutes from "./routes/requestRoutes.js"

const app = express()
const PORT = 3000

// เปิดใช้งาน CORS ให้ React (พอร์ต 5173) เรียกใช้งานได้
app.use(cors())
app.use(express.json())

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Root Route
app.get("/", (req, res) => {
  res.send("<h1>ENGSE203 - Week 06 & 07 Express API (CORS Enabled) 🚀</h1>")
})

// API Routes
app.use("/api/requests", requestRoutes)

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "404 - ไม่พบเส้นทาง API ที่คุณต้องการ" })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})