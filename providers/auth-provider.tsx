"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useAuthStore, DEMO_USERS } from "@/stores/auth-store"

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setToken, logout: storeLogout } = useAuthStore()

  const login = async (email: string, password: string) => {
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      throw new Error("Credenciales inválidas")
    }

    const token = `token_${user.id}_${Date.now()}`

    setUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      wallet_address: user.wallet_address,
    })
    setToken(token)
  }

  const logout = () => {
    storeLogout()
    window.location.href = "/"
  }

  return <AuthContext.Provider value={{ login, logout }}>{children}</AuthContext.Provider>
}
