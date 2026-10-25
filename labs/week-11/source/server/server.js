import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import requestRoutes from "./routes/requestRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// CP37: Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.get("/", (req, res) => {
  res.send("<h1>ENGSE203 - Week 11 Fullstack Production Server 🚀</h1>")
})

app.use("/api/requests", requestRoutes)

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "404 - ไม่พบเส้นทาง API" })
})

// CP38: Error Handling & Logging Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`)
  res.status(500).json({
    success: false,
    message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    error: process.env.NODE_ENV === "production" ? null : err.message
  })
})

app.listen(PORT, () => {
  console.log(`Production Server is running on port ${PORT}`)
})
