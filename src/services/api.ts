import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api"

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
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
      localStorage.removeItem("token")
      localStorage.removeItem("user")
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
}

export const productAPI = {
  getProducts: () => api.get("/products"),
  getProduct: (id: string) => api.get(`/products/${id}`),
  createProduct: (productData: any) => api.post("/products", productData),
  getTraceability: (id: string) => api.get(`/products/${id}/traceability`),
}

export const saleAPI = {
  createSale: (saleData: any) => api.post("/sales", saleData),
  getSales: () => api.get("/sales"),
}

export default api
