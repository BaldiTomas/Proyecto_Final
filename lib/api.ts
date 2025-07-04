import axios from "axios"
import { useAuthStore } from "@/stores/auth-store"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
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
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
}

export const userAPI = {
  getProfile: () => api.get("/profile"),
  registerUser: (userData: any) => api.post("/admin/users", userData),
  updateProfile: (userData: any) => api.put("/profile", userData),
}

export const productAPI = {
  getProducts: (params?: any) => api.get("/products", { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (productData: any) => api.post("/products", productData),
  updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),
  getTraceability: (id: string) => api.get(`/products/${id}/traceability`),
}

export const saleAPI = {
  createSale: (saleData: any) => api.post("/sales", saleData),
  getSales: (params?: any) => api.get("/sales", { params }),
  getSale: (id: string) => api.get(`/sales/${id}`),
}

export default api
