import React, { useState, useEffect } from "react"
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom"
import { fetchServices, saveServices, resetServices } from "./services/serviceApi"

// 1. Dashboard Component (รองรับ Loading, Error, Retry, Delete, Search)
function Dashboard({ services, setServices, loading, error, loadData }) {
  const [search, setSearch] = useState("")

  const handleDelete = (id) => {
    const updated = services.filter(item => item.id !== id)
    setServices(updated)
    saveServices(updated)
  }

  const handleReset = () => {
    const fresh = resetServices()
    setServices(fresh)
  }

  const filtered = services.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>⏳ กำลังโหลดข้อมูล...</div>
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#dc3545" }}>
        <p>❌ {error}</p>
        <button onClick={loadData} style={{ background: "#007bff", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>
          🔄 ลองใหม่อีกครั้ง (Retry)
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3>📊 รายการคำขอรับบริการทั้งหมด</h3>
        <button onClick={handleReset} style={{ background: "#6c757d", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>
          ♻️ รีเซ็ตข้อมูลเริ่มต้น
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <input 
          type="text" 
          placeholder="🔍 ค้นหาคำขอรับบริการ..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", padding: "1.5rem" }}>📭 ไม่พบข้อมูลคำขอรับบริการ</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map(item => (
            <li key={item.id} style={{ background: "#f9f9f9", marginBottom: "0.75rem", padding: "1rem", borderRadius: "6px", border: "1px solid #e1e4e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Link to={`/detail/${item.id}`} style={{ fontWeight: "bold", color: "#007bff", textDecoration: "none" }}>{item.title}</Link>
                <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.2rem" }}>หมวดหมู่: {item.category} | สถานะ: {item.status}</div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ background: "#dc3545", color: "#fff", border: "none", padding: "0.3rem 0.7rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// 2. New Request Component (Controlled Form)
function NewRequest({ services, setServices }) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Hardware")
  const [errorMsg, setErrorMsg] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg("กรุณากรอกหัวข้อคำขอรับบริการ")
      return
    }

    const newItem = {
      id: Date.now(),
      title: title.trim(),
      category,
      status: "รอดำเนินการ"
    }

    const updated = [newItem, ...services]
    setServices(updated)
    saveServices(updated)
    navigate("/")
  }

  return (
    <div>
      <h3>📝 เพิ่มคำขอรับบริการใหม่</h3>
      {errorMsg && <p style={{ color: "red", fontSize: "0.9rem" }}>{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
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
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "0.6rem", borderRadius: "4px", border: "1px solid #ccc" }}>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
          </select>
        </div>
        <button type="submit" style={{ background: "#28a745", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          บันทึกคำขอ
        </button>
      </form>
    </div>
  )
}

// 3. Request Detail Component
function RequestDetail({ services }) {
  const { id } = useParams()
  const item = services.find(s => s.id === Number(id))

  if (!item) {
    return <p style={{ color: "red" }}>❌ ไม่พบข้อมูลคำขอรับบริการนี้</p>
  }

  return (
    <div>
      <h3>🔍 รายละเอียดคำขอ (ID: {item.id})</h3>
      <p><strong>หัวข้อ:</strong> {item.title}</p>
      <p><strong>หมวดหมู่:</strong> {item.category}</p>
      <p><strong>สถานะ:</strong> {item.status}</p>
      <Link to="/" style={{ color: "#007bff", textDecoration: "none" }}>← กลับหน้า Dashboard</Link>
    </div>
  )
}

// 4. About Component
function About() {
  return (
    <div>
      <h3>ℹ️ เกี่ยวกับระบบ Mini App</h3>
      <p>ระบบจัดการคำขอรับบริการ (Campus Service Request) พัฒนาด้วย React และ React Router สำหรับวิชา ENGSE203 สัปดาห์ที่ 5</p>
    </div>
  )
}

// Main App Wrapper
export default function App() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchServices()
      setServices(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <HashRouter>
      <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto", background: "#f4f6f8", minHeight: "100vh" }}>
        <h1>ENGSE203 - Week 05: React Mini App</h1>
        <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", background: "#fff", padding: "1rem", borderRadius: "8px", border: "1px solid #ddd" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>Dashboard</Link>
          <Link to="/new" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>New Request</Link>
          <Link to="/about" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>About</Link>
        </nav>

        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #ddd" }}>
          <Routes>
            <Route path="/" element={<Dashboard services={services} setServices={setServices} loading={loading} error={error} loadData={loadData} />} />
            <Route path="/new" element={<NewRequest services={services} setServices={setServices} />} />
            <Route path="/detail/:id" element={<RequestDetail services={services} />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<h3>❌ 404 - ไม่พบหน้าเว็บ</h3>} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  )
}