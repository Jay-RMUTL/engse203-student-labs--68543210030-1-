import React, { useState } from "react"
import ServiceList from "./ServiceList.jsx"

export default function ServiceManager() {
  const [services, setServices] = useState([
    { id: 1, title: "แจ้งซ่อมโปรเจคเตอร์ห้อง Lab 301", category: "Hardware", status: "รอดำเนินการ" },
    { id: 2, title: "ขอสิทธิ์เข้าใช้งานฐานข้อมูลกลาง", category: "Network", status: "กำลังดำเนินการ" },
    { id: 3, title: "ติดตั้งโปรแกรม Node.js เพิ่มเติม", category: "Software", status: "เสร็จสิ้น" }
  ])
  
  const [searchKeyword, setSearchKeyword] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Hardware")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("กรุณากรอกหัวข้อคำขอรับบริการ")
      return
    }
    setError("")

    const newItem = {
      id: Date.now(),
      title: title.trim(),
      category: category,
      status: "รอดำเนินการ"
    }

    setServices([newItem, ...services])
    setTitle("")
  }

  // ฟังก์ชันลบข้อมูลผ่าน Callback (CP05)
  const handleDelete = (id) => {
    setServices(services.filter(item => item.id !== id))
  }

  const filteredServices = services.filter(item => 
    item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    item.category.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  return (
    <div style={{ marginTop: "1rem" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "1.25rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>📝 เพิ่มคำขอรับบริการใหม่ (Controlled Form)</h3>
        {error && <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{error}</p>}
        
        <div style={{ marginBottom: "1rem" }}>
          <input 
            type="text" 
            placeholder="ระบุหัวข้อคำขอ..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #ccc", background: "#fff" }}
          >
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
          </select>
        </div>

        <button type="submit" style={{ background: "#007bff", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          บันทึกคำขอ
        </button>
      </form>

      <div style={{ marginBottom: "1.5rem" }}>
        <input 
          type="text" 
          placeholder="🔍 ค้นหาตามหัวข้อหรือหมวดหมู่..." 
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "1rem", boxSizing: "border-box" }}
        />
      </div>

      <ServiceList services={filteredServices} onDelete={handleDelete} />
    </div>
  )
}