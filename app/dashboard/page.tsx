"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useWeb3Store } from "@/stores/web3-store"
import { StatsCards } from "@/app/dashboard/components/stats-cards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/providers/web3-provider"
import { Navbar } from "@/components/layout/navbar"
import { Wallet, Activity, Package, Users, Plus, Clock, CheckCircle, AlertCircle, Truck, ShoppingCart, HandCoins, Boxes } from "lucide-react"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const { isConnected, account, chainId } = useWeb3Store()
  const { connectWallet } = useWeb3()

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    loadDashboardData()
  }, [user, router, token])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    if (!user || !token) {
      setLoading(false)
      return
    }

    try {
      let currentStats: any = {}
      let currentActivity: any[] = []
      let apiUrl = ""

      switch (user.role) {
        case "admin":
          apiUrl = `${API_BASE_URL}/stats/admin`
          const adminResponse = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } })
          if (!adminResponse.ok) {
            throw new Error(`Error al cargar datos de administrador: ${adminResponse.statusText}`)
          }
          const adminData = await adminResponse.json()
          currentStats = {
            totalUsers: Number(adminData.users),
            activeProducts: Number(adminData.products),
            totalSales: Number(adminData.transactions),
            pendingShipments: Number(adminData.shipments),
            completedTransfers: Number(adminData.transfers),
          }
          currentActivity = adminData.recent_activity.map((item: any) => ({
            id: item.id,
            action: item.action,
            user_name: item.user_name,
            entity_type: item.entity_type,
            created_at: item.created_at,
          }))
          break

        case "producer":
          const producerProductsRes = await fetch(`${API_BASE_URL}/products?producer_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
          let producerProductsCount = 0;
          if (producerProductsRes.ok) {
            const data = await producerProductsRes.json();
            producerProductsCount = data.total || 0;
          }
          const myCustodyRes = await fetch(`${API_BASE_URL}/product_custodies?user_id=${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
          let myCustodyCount = 0, myCustodyStock = 0;
          if (myCustodyRes.ok) {
            const data = await myCustodyRes.json();
            myCustodyCount = data.custodies?.length || 0;
            myCustodyStock = data.custodies?.reduce((sum: number, c: any) => sum + Number(c.stock), 0) || 0;
          }
          currentStats = {
            myProductsProduced: producerProductsCount,
            myCustodyProducts: myCustodyCount,
            myCustodyStock,
          }
          currentActivity = []
          break

        case "seller":
          const statsRes = await fetch(`${API_BASE_URL}/stats/seller-stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!statsRes.ok) throw new Error("Error al obtener estadísticas del vendedor")
          const data = await statsRes.json()

          const s = data.sellerSalesStats || {}
          const products = data.productsInCustody || []
          const history = data.productHistory || []

          currentStats = {
            productsInCustody: products.length,
            productsInCustodyNames: products.map((p: any) => `${p.name} (${p.stock})`).join(", ") || "-",
            totalSales: s.total_sales_transactions || 0,
            totalItemsSold: s.total_items_sold || 0,
            totalRevenue: s.total_revenue ? Number(s.total_revenue).toFixed(2) : "0.00",
          }
          currentActivity = history.map((h: any) => ({
            id: h.id,
            action: h.action,
            product_name: h.product_name,
            actor_name: h.actor_name,
            notes: h.notes,
            date: h.timestamp,
          }))
          break

        case "distributor": {
          const res = await fetch(
            `${API_BASE_URL}/distributor/stats/distributor`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (!res.ok) throw new Error("Error al obtener estadísticas de distribuidor")
          const data = await res.json()

          currentStats = {
            activeShipments: data.activeShipments,
            completedShipments: data.completedShipments,
            pendingTransfers: data.pendingTransfers,
            productsInCustody: data.productsInCustody,
          }

          currentActivity = data.recentShipments.map((s: any) => ({
            id: s.id,
            product_name: s.product_name,
            status: s.status,
            action:
              s.status === "in_transit"
                ? "Envío iniciado"
                : s.status === "delivered"
                ? "Envío entregado"
                :s.status === "cancelled"
                ? "Envío cancelado"
                : `Envío ${s.status}`,
            actor_name: user.name,
            notes: s.notes || "",
            date: s.created_at,
          }))
          break
        }

        default:
          currentStats = {}
          currentActivity = []
      }

      setStats(currentStats)
      setRecentActivity(currentActivity)
    } catch (err: any) {
      console.error("Error al cargar datos del dashboard:", err)
      setError(err.message || "Error desconocido al cargar el dashboard.")
      toast.error(err.message || "Error al cargar los datos del dashboard.")
      setStats({})
      setRecentActivity([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_transit":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getQuickActions = () => {
    switch (user?.role) {
      case "admin":
        return [
          { icon: Users, label: "Gestionar Usuarios", action: () => router.push("/admin") },
          { icon: Package, label: "Ver Todos los Productos", action: () => router.push("/products") },
        ]
      case "producer":
        return [
          { icon: Plus, label: "Registrar Producto", action: () => router.push("/products/new") },
          { icon: Boxes, label: "Mis Productos", action: () => router.push("/products?filter=my-produced-products") },
          { icon: Package, label: "Productos en Custodia", action: () => router.push("/products?filter=my-custody-products") },
        ]
      case "distributor":
        return [
          { icon: Truck, label: "Ver Envíos", action: () => router.push("/distributor?tab=shipments") },
        ]
      case "seller":
        return [
          { icon: Boxes, label: "Mis Productos en Stock", action: () => router.push("/products?filter=seller-inventory") },
          { icon: ShoppingCart, label: "Registrar Nueva Venta", action: () => router.push("/sales") },
          { icon: HandCoins, label: "Comprar Productos", action: () => router.push("/sales") },
        ]
      case "user":
        return [
          { icon: Package, label: "Explorar Productos", action: () => router.push("/products") },
          { icon: Activity, label: "Rastrear Producto", action: () => router.push("/products") },
        ]
      default: return []
    }
  }

    const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Administrador"
      case "producer": return "Productor"
      case "seller": return "Vendedor"
      case "distributor": return "Distribuidor"
      case "user": return "Usuario"
      default: return role
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-lg">
        Redirigiendo al inicio de sesión...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded animate-pulse w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 bg-slate-700 rounded animate-pulse w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Error al cargar las estadísticas: {error}</p>
              <Button onClick={loadDashboardData} className="mt-4 bg-blue-600 hover:bg-blue-700">
                Reintentar
              </Button>
            </div>
          ) : (
            <StatsCards userRole={user.role} stats={stats} loading={loading} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Actividad Reciente</CardTitle>
                  <CardDescription className="text-gray-400">Últimas acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                          <div className="w-4 h-4 bg-slate-700 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-700 rounded animate-pulse mb-1"></div>
                            <div className="h-3 bg-slate-700 rounded animate-pulse w-2/3"></div>
                          </div>
                          <div className="w-16 h-3 bg-slate-700 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          {getStatusIcon('default')}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {activity.action} {activity.product_name ? `- ${activity.product_name}` : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                              {activity.actor_name || ""} {activity.notes ? `| ${activity.notes}` : ""}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {activity.date ? new Date(activity.date).toLocaleDateString() : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400">No hay actividad reciente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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