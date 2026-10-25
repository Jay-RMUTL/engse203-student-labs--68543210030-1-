import { apiRequest } from "../api/apiClient.js"

export const fetchServices = async () => {
  const result = await apiRequest("/requests")
  return result.data
}

export const createServiceItem = async (itemData) => {
  const result = await apiRequest("/requests", {
    method: "POST",
    body: JSON.stringify(itemData),
  })
  return result.data
}

export const deleteServiceItem = async (id) => {
  const result = await apiRequest(`/requests/${id}`, {
    method: "DELETE",
  })
  return result.data
}

export const updateServiceStatus = async (id, status) => {
  const result = await apiRequest(`/requests/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
  return result.data
}