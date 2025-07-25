"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useWeb3Store } from "@/stores/web3-store"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { User, Mail, Shield, Wallet, Save, X } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const { account, isConnected } = useWeb3Store()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setUser({ ...user, ...formData })
    toast.success("Perfil actualizado exitosamente")
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    })
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "producer":
        return "Productor"
      case "seller":
        return "Vendedor"
      case "distributor":
        return "Distribuidor"
      case "user":
        return "Usuario"
      default:
        return role
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Configuración del Perfil</h1>
            <p className="text-gray-400 mt-2">Gestiona la información de tu cuenta y preferencias</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{user.name}</CardTitle>
                    <CardDescription className="text-gray-400">{user.email}</CardDescription>
                    <Badge variant="secondary" className="mt-2 bg-slate-700 text-gray-300">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>

              </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Nombre Completo</p>
                      <p className="text-sm text-gray-400">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Correo Electrónico</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Rol</p>
                      <p className="text-sm text-gray-400">{getRoleLabel(user.role)}</p>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Wallet className="w-5 h-5" />
                <span>Información de Wallet</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Estado de conexión de tu wallet blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Estado</span>
                    <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Conectada
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-white">Dirección de Wallet</p>
                    <code className="text-sm bg-slate-700 px-2 py-1 rounded font-mono text-gray-300 break-all">
                      {account}
                    </code>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No hay Wallet Conectada</h3>
                  <p className="text-gray-400 mb-4">Conecta tu wallet para habilitar funciones blockchain</p>
                  <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                    Ir al Panel Principal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
