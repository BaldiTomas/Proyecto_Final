"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, DEMO_USERS } from "@/stores/auth-store"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Users, Package, Activity, Plus, Shield, Edit, Trash2 } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
  wallet_address: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [users, setUsers] = useState<User[]>(
    DEMO_USERS.map((u, index) => {
      const { password, ...rest } = u
      return { ...rest, id: index + 1, wallet_address: `0x${Math.random().toString(16).slice(2, 42)}` }
    })
  )

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  })

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h2>
            <p className="text-gray-400">No tienes permisos para acceder a esta página.</p>
          </div>
        </main>
      </div>
    )
  }

  const handleCreateUser = () => {
    const { name, email, role, password } = newUser

    if (!name || !email || !role || !password) {
      toast.error("Por favor completa todos los campos")
      return
    }

    if (!email.includes("@")) {
      toast.error("Correo electrónico inválido")
      return
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    const user: User = {
      id: users.length + 1,
      name,
      email,
      role,
      wallet_address: `0x${Math.random().toString(16).slice(2, 42)}`,
    }

    setUsers([...users, user])
    setNewUser({ name: "", email: "", role: "", password: "" })
    setIsCreateUserOpen(false)
    toast.success("Usuario creado exitosamente")
  }

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((u) => u.id !== userId))
    toast.success("Usuario eliminado")
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

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-900/20 text-green-400 border-green-600"
      : "bg-red-900/20 text-red-400 border-red-600"
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
              <p className="text-gray-400 mt-1">Gestiona usuarios, productos y configuración del sistema</p>
            </div>
            <Badge variant="secondary" className="w-fit bg-slate-700 text-gray-300">
              <Shield className="w-4 h-4 mr-2" />
              Administrador
            </Badge>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-blue-600">
                Productos
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
                Actividad
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
                Configuración
              </TabsTrigger>
            </TabsList>

            {/* USERS */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Gestión de Usuarios</h2>
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Crear Nuevo Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white">
                          Nombre Completo
                        </Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-white">
                          Correo Electrónico
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-white">
                          Contraseña
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-white">
                          Rol
                        </Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="producer">Productor</SelectItem>
                            <SelectItem value="seller">Vendedor</SelectItem>
                            <SelectItem value="distributor">Distribuidor</SelectItem>
                            <SelectItem value="user">Usuario</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                          Crear Usuario
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateUserOpen(false)}
                          className="border-slate-600 text-gray-300"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => (
                  <Card key={user.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">{user.name}</CardTitle>
                          <CardDescription className="text-gray-400">{user.email}</CardDescription>
                        </div>
                        <Badge className={getStatusColor("active")}>Activo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-slate-600 text-gray-300">
                          {getRoleLabel(user.role)}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => toast.info("Función en desarrollo")}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Resumen de Productos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Package className="w-5 h-5" />
                      <span>Total de Productos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">1,234</div>
                    <p className="text-sm text-gray-400">+8% desde el mes pasado</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Activity className="w-5 h-5" />
                      <span>Verificados</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">1,156</div>
                    <p className="text-sm text-gray-400">93.7% tasa de verificación</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Users className="w-5 h-5" />
                      <span>Pendientes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">78</div>
                    <p className="text-sm text-gray-400">Esperando verificación</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Actividad del Sistema</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Eventos Recientes del Sistema</CardTitle>
                  <CardDescription className="text-gray-400">Últimas actividades en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Usuario registrado", details: "Nueva cuenta de productor creada", time: "hace 5 min" },
                      {
                        action: "Producto verificado",
                        details: "Granos de Café Orgánico aprobados",
                        time: "hace 12 min",
                      },
                      { action: "Venta completada", details: "Transacción #1234 procesada", time: "hace 1 hora" },
                      { action: "Respaldo del sistema", details: "Respaldo diario completado", time: "hace 2 horas" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-700/50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{activity.action}</p>
                          <p className="text-xs text-gray-400">{activity.details}</p>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Configuración del Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Configuración Blockchain</CardTitle>
                    <CardDescription className="text-gray-400">Configurar ajustes de red blockchain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white">Red</label>
                        <p className="text-sm text-gray-400">Ethereum Mainnet</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white">Precio del Gas</label>
                        <p className="text-sm text-gray-400">Automático</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-gray-300 bg-transparent"
                        onClick={() => toast.info("Función en desarrollo")}
                      >
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Configuración de Seguridad</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestionar opciones de seguridad del sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-white">Autenticación de Dos Factores</label>
                        <p className="text-sm text-gray-400">Habilitado</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-white">Tiempo de Sesión</label>
                        <p className="text-sm text-gray-400">24 horas</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-gray-300 bg-transparent"
                        onClick={() => toast.info("Función en desarrollo")}
                      >
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
