const API_BASE_URL = "http://localhost:3000/api"

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ API")
    }
    return data
  } catch (error) {
    throw error
  }
}