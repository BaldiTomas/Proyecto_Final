"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { authAPI } from "@/lib/api"

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
  const { setUser, setToken, logout: storeLogout, token } = useAuthStore()

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data

      setUser(user)
      setToken(token)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Error de autenticación")
    }
  }

  const logout = () => {
    storeLogout()
    window.location.href = "/login"
  }

  return <AuthContext.Provider value={{ login, logout }}>{children}</AuthContext.Provider>
}
