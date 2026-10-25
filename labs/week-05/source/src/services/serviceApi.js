// Service Layer สำหรับ Week 05
const STORAGE_KEY = "engse203_week05_services"

const initialData = [
  { id: 1, title: "แจ้งซ่อมโปรเจคเตอร์ห้อง Lab 301", category: "Hardware", status: "รอดำเนินการ" },
  { id: 2, title: "ขอสิทธิ์เข้าใช้งานฐานข้อมูลกลาง", category: "Network", status: "กำลังดำเนินการ" },
  { id: 3, title: "ติดตั้งโปรแกรม Node.js เพิ่มเติม", category: "Software", status: "เสร็จสิ้น" }
]

export const fetchServices = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.15) {
        reject(new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง"))
        return
      }

      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
        resolve(initialData)
      } else {
        resolve(JSON.parse(saved))
      }
    }, 800)
  })
}

export const saveServices = (services) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
}

export const resetServices = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
  return initialData
}