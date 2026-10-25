import React, { useState, useEffect } from "react"
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom"

const API_URL = "http://localhost:3000/api/requests"

function Dashboard({ services, setServices, loading, error, loadData }) {
  const [search, setSearch] = useState("")

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      setServices(services.filter(item => item.id !== id))
    } catch (err) { alert("ลบไม่สำเร็จ") }
  }

  const handleStatusChange = async (id, currentStatus) => {
    const nextStatus = currentStatus === "รอดำเนินการ" ? "กำลังดำเนินการ" : currentStatus === "กำลังดำเนินการ" ? "เสร็จสิ้น" : "รอดำเนินการ"
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      })
      const data = await res.json()
      setServices(services.map(item => item.id === id ? data.data : item))
    } catch (err) { alert("อัปเดตสถานะไม่สำเร็จ") }
  }

  const filtered = services.filter(item => item.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div style={{ textAlign: "center", padding: "2rem" }}>⏳ กำลังโหลดข้อมูล...</div>
  if (error) return <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>❌ {error} <button onClick={loadData}>ลองใหม่</button></div>

  return (
    <div>
      <h3>📊 รายการคำขอรับบริการ (Week 07 - API Connected)</h3>
      <input type="text" placeholder="🔍 ค้นหา..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", boxSizing: "border-box" }} />
      {filtered.length === 0 ? <p>📭 ไม่พบข้อมูล</p> : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map(item => (
            <li key={item.id} style={{ background: "#f9f9f9", marginBottom: "0.75rem", padding: "1rem", borderRadius: "6px", border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Link to={`/detail/${item.id}`} style={{ fontWeight: "bold", color: "#007bff", textDecoration: "none" }}>{item.title}</Link>
                <div style={{ fontSize: "0.85rem", color: "#555" }}>หมวดหมู่: {item.category} | สถานะ: <span style={{ color: "green", fontWeight: "bold" }}>{item.status}</span></div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleStatusChange(item.id, item.status)} style={{ background: "#ffc107", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px", cursor: "pointer" }}>เปลี่ยนสถานะ</button>
                <button onClick={() => handleDelete(item.id)} style={{ background: "#dc3545", color: "#fff", border: "none", padding: "0.3rem 0.7rem", borderRadius: "4px", cursor: "pointer" }}>ลบ</button>
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
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category })
      })
      navigate("/")
    } catch (err) { alert("เพิ่มไม่สำเร็จ") }
  }

  return (
    <div>
      <h3>📝 เพิ่มคำขอรับบริการใหม่</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="ระบุหัวข้อคำขอ..." value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem", boxSizing: "border-box" }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "0.6rem", marginBottom: "1rem" }}>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
        </select>
        <button type="submit" style={{ background: "#28a745", color: "#fff", border: "none", padding: "0.6rem 1.2rem", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>บันทึก</button>
      </form>
    </div>
  )
}

function RequestDetail({ services }) {
  const { id } = useParams()
  const item = services.find(s => s.id === Number(id))
  if (!item) return <p style={{ color: "red" }}>❌ ไม่พบข้อมูล</p>
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
      const res = await fetch(API_URL)
      const data = await res.json()
      setServices(data.data)
    } catch (err) { setError("เชื่อมต่อ API ไม่สำเร็จ") }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  return (
    <HashRouter>
      <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "0 auto", background: "#f4f6f8", minHeight: "100vh" }}>
        <h1>ENGSE203 - Week 07 Mini App</h1>
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