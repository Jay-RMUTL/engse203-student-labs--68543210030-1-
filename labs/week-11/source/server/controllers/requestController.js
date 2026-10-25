import * as requestService from "../services/requestService.js"

export const getRequests = (req, res) => {
  try {
    const data = requestService.getAllRequests()
    res.json({ success: true, count: data.length, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const getRequest = (req, res) => {
  try {
    const item = requestService.getRequestById(req.params.id)
    if (!item) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลคำขอรับบริการ" })
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createRequest = (req, res) => {
  try {
    const { title, category, requester, requester_id } = req.body
    if (!title || !title.trim()) return res.status(400).json({ success: false, message: "กรุณากรอกหัวข้อคำขอ" })
    const newItem = requestService.createRequest({ title, category, requester, requester_id })
    res.status(201).json({ success: true, message: "เพิ่มคำขอสำเร็จ", data: newItem })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateStatus = (req, res) => {
  try {
    const { status } = req.body
    const updated = requestService.updateRequestStatus(req.params.id, status)
    if (!updated) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลที่ต้องการอัปเดต" })
    res.json({ success: true, message: "อัปเดตสถานะสำเร็จ", data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const removeRequest = (req, res) => {
  try {
    const deleted = requestService.deleteRequest(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: "ไม่พบข้อมูลที่ต้องการลบ" })
    res.json({ success: true, message: "ลบข้อมูลสำเร็จ", data: deleted })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
