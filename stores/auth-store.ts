import { create } from "zustand"

interface User {
  id: number
  name: string
  email: string
  role: string
  wallet_address: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, token: null }),
}))

export const DEMO_USERS = [
  {
    id: 1,
    name: "Admin Principal",
    email: "admin@trackchain.com",
    password: "admin123",
    role: "admin",
    wallet_address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    id: 2,
    name: "Juan Productor",
    email: "productor@trackchain.com",
    password: "productor123",
    role: "producer",
    wallet_address: "0x8ba1f109551bD432803012645Hac136c0532925a",
  },
  {
    id: 3,
    name: "María Vendedora",
    email: "vendedor@trackchain.com",
    password: "vendedor123",
    role: "seller",
    wallet_address: "0x1234567890123456789012345678901234567890",
  },
  {
    id: 4,
    name: "Carlos Distribuidor",
    email: "distribuidor@trackchain.com",
    password: "distribuidor123",
    role: "distributor",
    wallet_address: "0x0987654321098765432109876543210987654321",
  },
  {
    id: 5,
    name: "Ana Usuario",
    email: "usuario@trackchain.com",
    password: "usuario123",
    role: "user",
    wallet_address: "0x1111222233334444555566667777888899990000",
  },
]
