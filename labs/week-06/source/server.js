import express from "express"
import requestRoutes from "./routes/requestRoutes.js"

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// Root Route
app.get("/", (req, res) => {
  res.send("<h1>ENGSE203 - Week 06 Express API (Layered Architecture) 🚀</h1>")
})

// API Routes
app.use("/api/requests", requestRoutes)

// 404 Not Found Handler (CP07)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "404 - ไม่พบเส้นทาง API ที่คุณต้องการ" })
})

// Global Error Handler (CP07)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})