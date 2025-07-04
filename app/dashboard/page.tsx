"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useWeb3Store } from "@/stores/web3-store"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/providers/web3-provider"
import { Navbar } from "@/components/layout/navbar"
import { Wallet, Activity, Package, Users, Plus, Clock, CheckCircle, AlertCircle, Truck } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isConnected, account, chainId } = useWeb3Store()
  const { connectWallet } = useWeb3()
  const [recentActivity] = useState([
    {
      id: 1,
      action: "Producto Creado",
      product: "Granos de Café Orgánico",
      time: "hace 2 horas",
      status: "success",
    },
    {
      id: 2,
      action: "Venta Completada",
      product: "Hojas de Té Premium",
      time: "hace 4 horas",
      status: "success",
    },
    {
      id: 3,
      action: "Producto Transferido",
      product: "Miel Artesanal",
      time: "hace 6 horas",
      status: "pending",
    },
    {
      id: 4,
      action: "Verificación Fallida",
      product: "Especias Orgánicas",
      time: "hace 1 día",
      status: "error",
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getQuickActions = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            icon: Users,
            label: "Gestionar Usuarios",
            action: () => router.push("/admin"),
          },
          {
            icon: Package,
            label: "Ver Todos los Productos",
            action: () => router.push("/products"),
          },
        ]
      case "producer":
        return [
          {
            icon: Plus,
            label: "Registrar Producto",
            action: () => router.push("/products/new"),
          },
          {
            icon: Activity,
            label: "Actualizar Estado",
            action: () => router.push("/products"),
          },
        ]
      default:
        return [
          {
            icon: Package,
            label: "Explorar Productos",
            action: () => router.push("/products"),
          },
          {
            icon: Activity,
            label: "Rastrear Producto",
            action: () => router.push("/products"),
          },
        ]
    }
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Bienvenido, {user.name}</h1>
              <p className="text-gray-400 mt-1">Panel de control - {getRoleLabel(user.role)}</p>
            </div>

            {!isConnected && (
              <Card className="p-4 bg-slate-800 border-slate-700">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Conectar Wallet</p>
                    <p className="text-xs text-gray-400">Habilitar funciones blockchain</p>
                  </div>
                  <Button onClick={connectWallet} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Conectar
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Wallet Status */}
          {isConnected && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-900/20 rounded-lg">
                      <Wallet className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Wallet Conectada</p>
                      <p className="text-xs text-gray-400">{account}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    Red: {chainId}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <StatsCards userRole={user.role} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Actividad Reciente</CardTitle>
                  <CardDescription className="text-gray-400">
                    Últimas acciones en tu cadena de suministro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        {getStatusIcon(activity.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.action}</p>
                          <p className="text-xs text-gray-400">{activity.product}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Acciones Rápidas</CardTitle>
                  <CardDescription className="text-gray-400">Tareas comunes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getQuickActions().map((action, index) => {
                      const Icon = action.icon
                      return (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto hover:bg-slate-700 text-gray-300 hover:text-white"
                          onClick={action.action}
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          <span>{action.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
