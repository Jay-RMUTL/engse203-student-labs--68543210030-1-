import fs from "fs"
import path from "path"

const filePath = path.resolve("data/requests.json")

export const getAllRequests = () => {
  if (!fs.existsSync(filePath)) return []
  const data = fs.readFileSync(filePath, "utf8")
  return JSON.parse(data)
}

export const getRequestById = (id) => {
  const requests = getAllRequests()
  return requests.find(r => r.id === Number(id))
}

export const createRequest = (newReqData) => {
  const requests = getAllRequests()
  const newItem = {
    id: Date.now(),
    title: newReqData.title.trim(),
    category: newReqData.category || "General",
    status: "รอดำเนินการ"
  }
  requests.push(newItem)
  fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), "utf8")
  return newItem
}

export const deleteRequest = (id) => {
  let requests = getAllRequests()
  const index = requests.findIndex(r => r.id === Number(id))
  if (index === -1) return null

  const deleted = requests.splice(index, 1)[0]
  fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), "utf8")
  return deleted
}