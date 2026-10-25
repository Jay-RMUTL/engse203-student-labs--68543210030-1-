import React, { useState, useEffect } from "react"
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom"
import { fetchServices, createServiceItem, deleteServiceItem, updateServiceStatus } from "./services/serviceApi"

function Dashboard({ services, setServices, loading, error, loadData }) {
  const [search, setSearch] = useState("")

  const handleDelete = async (id) => {
    try {
      await deleteServiceItem(id)
      setServices(services.filter(item => item.id !== id))
    } catch (err) {
      alert("ลบข้อมูลไม่สำเร็จ: " + err.message)
    }
  }

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === "รอดำเนินการ" ? "กำลังดำเนินการ" : currentStatus === "กำลังดำเนินการ" ? "เสร็จสิ้น" : "รอดำเนินการ"
    try {
      const updated = await updateServiceStatus(id, nextStatus)
      setServices(services.map(item => item.id === id ? updated : item))
    } catch (err) {
      alert("อัปเดตสถานะไม่สำเร็จ: " + err.message)
    }
  }

  const filtered = services.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ textAlign: "center", padding: "2rem" }}>⏳ กำลังโหลดข้อมูลจาก Express API...</div>
  if (error) return (
    <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
      <p>❌ {error}</p>
      <button onClick={loadData} style={{ padding: "0.5rem 1rem", background: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>🔄 ลองใหม่อีกครั้ง</button>
    </div>
  )

  return (
    <div>
      <h3>📊 รายการคำขอรับบริการ (เชื่อมต่อ API จริง)</h3>
      <input 
        type="text" 
        placeholder="🔍 ค้นหาคำขอ..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
      />
      {filtered.length === 0 ? <p style={{ textAlign: "center", color: "#888" }}>📭 ไม่พบข้อมูลคำขอรับบริการ</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map(item => (
            <li key={item.id} style={{ background: "#f9f9f9", marginBottom: "0.75rem", padding: "1rem", borderRadius: "6px", border: "1px solid #e1e4e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Link to={`/detail/${item.id}`} style={{ fontWeight: "bold", color: "#007bff", textDecoration: "none" }}>{item.title}</Link>
                <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.2rem" }}>หมวดหมู่: {item.category} | สถานะ: <span style={{ color: "green", fontWeight: "bold" }}>{item.status}</span></div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleStatusChange(item.id, item.status)} style={{ background: "#ffc107", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>เปลี่ยนสถานะ</button>
                <button onClick={() => handleDelete(item.id)} style={{ background: "#dc3545", color: "#fff", border: "none", padding: "0.3rem 0.7rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}>ลบ</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NewRequest({ setServices }) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Hardware")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return alert("กรุณากรอกหัวข้อ")
    try {
      await createServiceItem({ title, category })
      navigate("/")
    } catch (err) {
      alert("เพิ่มข้อมูลไม่สำเร็จ: " + err.message)
    }
  }

  return (
    <div>
      <h3>📝 เพิ่มคำขอรับบริการใหม่ (บันทึกลง Backend API)</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="ระบุหัวข้อคำขอ..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ccc" }}>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
        </select>
        <button type="submit" style={{ background: "#28a745", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>บันทึกคำขอ</button>
      </form>
    </div>
  )
}

function RequestDetail({ services }) {
  const { id } = useParams()
  const item = services.find(s => s.id === Number(id))
  if (!item) return <p style={{ color: "red" }}>❌ ไม่พบข้อมูลคำขอ</p>
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
      setError("ไม่สามารถเชื่อมต่อ Backend API ได้ (ตรวจสอบว่ารันพอร์ต 3000 หรือยัง)")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <HashRouter>
      <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto", background: "#f4f6f8", minHeight: "100vh" }}>
        <h1>ENGSE203 - Week 07: React + Express API</h1>
        <nav style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", background: "#fff", padding: "1rem", borderRadius: "8px", border: "1px solid #ddd" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>Dashboard</Link>
          <Link to="/new" style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}>New Request</Link>
        </nav>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #ddd" }}>
          <Routes>
            <Route path="/" element={<Dashboard services={services} setServices={setServices} loading={loading} error={error} loadData={loadData} />} />
            <Route path="/new" element={<NewRequest setServices={setServices} />} />
            <Route path="/detail/:id" element={<RequestDetail services={services} />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  )
}