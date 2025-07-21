import axios from "axios"
import { useAuthStore } from "@/stores/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: (email: string, password: string) =>
    axios.post("http://localhost:3001/api/auth/login", { email, password }),
}

export const userAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (userData: any) => api.put("/profile", userData),
  registerUser: (userData: any) => api.post("/admin/users", userData),
  getUsers: (params?: any) => api.get("/admin/users", { params }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  updateUser: (id: number, userData: any) => api.put(`/admin/users/${id}`, userData),
}

export const productAPI = {
  getProducts: (params?: any) => api.get("/products", { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (productData: any) => api.post("/products", productData),
  updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getTraceability: (id: string) => api.get(`/products/${id}`),
}

export const saleAPI = {
  createSale: (saleData: any) => api.post("/transactions", saleData),
  getSales: (params?: any) => api.get("/transactions", { params }),
  getSale: (id: string) => api.get(`/transactions/${id}`),
}

export const shipmentAPI = {
  createShipment: (shipmentData: any) => api.post("/shipments", shipmentData),
  getShipments: (params?: any) => api.get("/shipments", { params }),
  updateShipmentStatus: (id: string, status: string) => api.put(`/shipments/${id}/status`, { status }),
}

export const transferAPI = {
  createTransfer: (transferData: any) => api.post("/transfers", transferData),
  getTransfers: (params?: any) => api.get("/transfers", { params }),
  completeTransfer: (id: string) => api.put(`/transfers/${id}/complete`),
}

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
}

export const distributorAPI = {
  getStats: () => api.get("/distributor/stats"),
}

export default api
