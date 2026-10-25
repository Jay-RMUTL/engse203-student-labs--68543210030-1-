import Database from "better-sqlite3"
import path from "path"

const dbPath = path.resolve("database/campus.db")
const db = new Database(dbPath)

export const getAllRequests = () => {
  const stmt = db.prepare(`
    SELECT requests.id, requests.title, requests.category, requests.status, 
           users.id AS requester_id, users.fullname AS requester_name, users.username
    FROM requests
    JOIN users ON requests.requester_id = users.id
  `)
  return stmt.all()
}

export const getRequestById = (id) => {
  const stmt = db.prepare(`
    SELECT requests.id, requests.title, requests.category, requests.status, 
           users.id AS requester_id, users.fullname AS requester_name, users.username
    FROM requests
    JOIN users ON requests.requester_id = users.id
    WHERE requests.id = ?
  `)
  return stmt.get(id)
}

export const createRequest = (newReqData) => {
  let requesterId = newReqData.requester_id || 1
  if (newReqData.requester) {
    const userStmt = db.prepare("SELECT id FROM users WHERE username = ? OR fullname = ?")
    let user = userStmt.get(newReqData.requester, newReqData.requester)
    if (user) requesterId = user.id
  }
  const stmt = db.prepare("INSERT INTO requests (title, category, status, requester_id) VALUES (?, ?, ?, ?)")
  const info = stmt.run(newReqData.title.trim(), newReqData.category || "General", newReqData.status || "รอดำเนินการ", requesterId)
  return getRequestById(info.lastInsertRowid)
}

export const updateRequestStatus = (id, status) => {
  const stmt = db.prepare("UPDATE requests SET status = ? WHERE id = ?")
  const info = stmt.run(status, id)
  if (info.changes === 0) return null
  return getRequestById(id)
}

export const deleteRequest = (id) => {
  const item = getRequestById(id)
  if (!item) return null
  const stmt = db.prepare("DELETE FROM requests WHERE id = ?")
  stmt.run(id)
  return item
}
