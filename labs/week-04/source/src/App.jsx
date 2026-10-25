import React from "react"
import Header from "./components/Header.jsx"
import ServiceManager from "./components/ServiceManager.jsx"

export default function App() {
  return (
    <div style={{ padding: "2.5rem", fontFamily: "sans-serif", maxWidth: "650px", margin: "0 auto", background: "#f4f6f8", minHeight: "100vh" }}>
      <Header 
        title="ENGSE203 - Week 04: React Components & State" 
        subtitle="CP03: ใช้งาน useState และ Filter Events สำเร็จ! 🚀" 
      />
      <ServiceManager />
    </div>
  )
}