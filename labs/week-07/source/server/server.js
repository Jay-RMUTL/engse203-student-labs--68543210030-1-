import express from "express"
import cors from "cors"
import requestRoutes from "./routes/requestRoutes.js"

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

app.get("/", (req, res) => {
  res.send("<h1>ENGSE203 - Week 07 API Server (Layered Architecture) 🚀</h1>")
})

app.use("/api/requests", requestRoutes)

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "404 - ไม่พบเส้นทาง API" })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์", error: err.message })
})

app.listen(PORT, () => {
  console.log(`API Server is running at http://localhost:${PORT}`)
})