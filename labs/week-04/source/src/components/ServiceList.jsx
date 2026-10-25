import React from "react"

export default function ServiceList({ services, onDelete }) {
  // Conditional Rendering เมื่อไม่มีข้อมูล (CP05)
  if (!services || services.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666", background: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}>
        <p>📭 ไม่พบรายการคำขอรับบริการในขณะนี้</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h3>รายการคำขอรับบริการ (Service Requests)</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {services.map((item) => (
          <li key={item.id} style={{ 
            background: "#fff", 
            marginBottom: "0.75rem", 
            padding: "1rem", 
            borderRadius: "6px", 
            border: "1px solid #ddd",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>{item.title}</strong> - <span style={{ color: "#555" }}>{item.category}</span>
              <div style={{ fontSize: "0.9rem", color: "#888", marginTop: "0.3rem" }}>สถานะ: {item.status}</div>
            </div>
            {/* ปุ่มลบเรียกใช้ Callback Props (CP05) */}
            <button 
              onClick={() => onDelete(item.id)}
              style={{ background: "#dc3545", color: "#fff", border: "none", padding: "0.4rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.9rem" }}
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}