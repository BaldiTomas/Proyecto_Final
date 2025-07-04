"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useWeb3Store } from "@/stores/web3-store"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Truck, Package, ArrowRightLeft, Plus, Shield, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  category: string
  producer_name: string
  current_custody_id: number
}

interface Shipment {
  id: number
  product_id: number
  product_name: string
  origin: string
  destination: string
  transport_company: string
  quantity: number
  status: "in_transit" | "delivered" | "cancelled"
  notes: string
  created_at: string
}

interface Transfer {
  id: number
  product_id: number
  product_name: string
  from_user_name: string
  to_user_name: string
  quantity: number
  status: "pending" | "completed" | "rejected"
  notes: string
  created_at: string
}

export default function DistributorPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { isConnected } = useWeb3Store()

  const [products, setProducts] = useState<Product[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)

  const [newShipment, setNewShipment] = useState({
    product_id: "",
    origin: "",
    destination: "",
    transport_company: "",
    quantity: "",
    notes: "",
  })

  const [newTransfer, setNewTransfer] = useState({
    product_id: "",
    to_user_email: "",
    quantity: "",
    notes: "",
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (user && user.role === "distributor") {
      loadInitialData()
    }
  }, [user])

  const loadInitialData = () => {
    // Simular datos de productos en custodia del distribuidor
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Granos de Café Orgánico",
        description: "Café orgánico de alta calidad",
        category: "Alimentos",
        producer_name: "Juan Productor",
        current_custody_id: user?.id || 0,
      },
      {
        id: 2,
        name: "Hojas de Té Premium",
        description: "Té premium de montaña",
        category: "Bebidas",
        producer_name: "Juan Productor",
        current_custody_id: user?.id || 0,
      },
    ]

    const mockShipments: Shipment[] = [
      {
        id: 1,
        product_id: 1,
        product_name: "Granos de Café Orgánico",
        origin: "Finca El Paraíso",
        destination: "Centro de Distribución Norte",
        transport_company: "TransLogística S.A.",
        quantity: 100,
        status: "in_transit",
        notes: "Envío urgente",
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        product_id: 2,
        product_name: "Hojas de Té Premium",
        origin: "Plantación Montaña Verde",
        destination: "Almacén Central",
        transport_company: "Cargo Express",
        quantity: 50,
        status: "delivered",
        notes: "Entregado sin novedad",
        created_at: "2024-01-14T08:15:00Z",
      },
    ]

    const mockTransfers: Transfer[] = [
      {
        id: 1,
        product_id: 1,
        product_name: "Granos de Café Orgánico",
        from_user_name: "Carlos Distribuidor",
        to_user_name: "María Vendedora",
        quantity: 25,
        status: "pending",
        notes: "Transferencia para venta local",
        created_at: "2024-01-15T14:20:00Z",
      },
    ]

    const mockUsers = [
      { id: 3, name: "María Vendedora", email: "vendedor@trackchain.com", role: "seller" },
      { id: 5, name: "Ana Usuario", email: "usuario@trackchain.com", role: "user" },
    ]

    setProducts(mockProducts)
    setShipments(mockShipments)
    setTransfers(mockTransfers)
    setUsers(mockUsers)
  }

  const handleRegisterShipment = async () => {
    if (!newShipment.product_id || !newShipment.origin || !newShipment.destination || !newShipment.quantity) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    if (!isConnected) {
      toast.error("Conecta tu wallet para registrar el envío en blockchain")
      return
    }

    try {
      // Simular registro en blockchain
      const shipmentId = shipments.length + 1
      const product = products.find((p) => p.id === Number.parseInt(newShipment.product_id))

      const newShipmentData: Shipment = {
        id: shipmentId,
        product_id: Number.parseInt(newShipment.product_id),
        product_name: product?.name || "",
        origin: newShipment.origin,
        destination: newShipment.destination,
        transport_company: newShipment.transport_company,
        quantity: Number.parseFloat(newShipment.quantity),
        status: "in_transit",
        notes: newShipment.notes,
        created_at: new Date().toISOString(),
      }

      setShipments([newShipmentData, ...shipments])
      setNewShipment({
        product_id: "",
        origin: "",
        destination: "",
        transport_company: "",
        quantity: "",
        notes: "",
      })
      setIsShipmentDialogOpen(false)
      toast.success("Envío registrado exitosamente en blockchain")
    } catch (error) {
      console.error("Error registrando envío:", error)
      toast.error("Error al registrar el envío. Verifica tu conexión de red.")
    }
  }

  const handleTransferProduct = async () => {
    if (!newTransfer.product_id || !newTransfer.to_user_email || !newTransfer.quantity) {
      toast.error("Por favor completa todos los campos obligatorios")
      return
    }

    if (!isConnected) {
      toast.error("Conecta tu wallet para registrar la transferencia en blockchain")
      return
    }

    try {
      // Simular transferencia en blockchain
      const transferId = transfers.length + 1
      const product = products.find((p) => p.id === Number.parseInt(newTransfer.product_id))
      const toUser = users.find((u) => u.email === newTransfer.to_user_email)

      const newTransferData: Transfer = {
        id: transferId,
        product_id: Number.parseInt(newTransfer.product_id),
        product_name: product?.name || "",
        from_user_name: user?.name || "",
        to_user_name: toUser?.name || "",
        quantity: Number.parseFloat(newTransfer.quantity),
        status: "pending",
        notes: newTransfer.notes,
        created_at: new Date().toISOString(),
      }

      setTransfers([newTransferData, ...transfers])
      setNewTransfer({
        product_id: "",
        to_user_email: "",
        quantity: "",
        notes: "",
      })
      setIsTransferDialogOpen(false)
      toast.success("Transferencia iniciada exitosamente en blockchain")
    } catch (error) {
      console.error("Error iniciando transferencia:", error)
      toast.error("Error al iniciar la transferencia. Verifica tu conexión de red.")
    }
  }

  const updateShipmentStatus = (shipmentId: number, status: "delivered" | "cancelled") => {
    setShipments(shipments.map((s) => (s.id === shipmentId ? { ...s, status } : s)))
    toast.success(`Estado del envío actualizado a ${status === "delivered" ? "entregado" : "cancelado"}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in_transit":
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "cancelled":
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-green-900/20 text-green-400 border-green-600"
      case "in_transit":
      case "pending":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-600"
      case "cancelled":
      case "rejected":
        return "bg-red-900/20 text-red-400 border-red-600"
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {user && user.role === "distributor" ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Panel de Distribuidor</h1>
                <p className="text-gray-400 mt-1">Gestiona envíos y transferencias de productos</p>
              </div>
              <Badge variant="secondary" className="w-fit bg-slate-700 text-gray-300">
                <Truck className="w-4 h-4 mr-2" />
                Distribuidor
              </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Productos en Custodia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{products.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Envíos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {shipments.filter((s) => s.status === "in_transit").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Transferencias Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {transfers.filter((t) => t.status === "pending").length}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Entregas Completadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {shipments.filter((s) => s.status === "delivered").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="shipments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
                <TabsTrigger value="shipments" className="data-[state=active]:bg-blue-600">
                  Envíos
                </TabsTrigger>
                <TabsTrigger value="transfers" className="data-[state=active]:bg-blue-600">
                  Transferencias
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-blue-600">
                  Productos en Custodia
                </TabsTrigger>
              </TabsList>

              {/* Shipments Tab */}
              <TabsContent value="shipments" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Gestión de Envíos</h2>
                  <Dialog open={isShipmentDialogOpen} onOpenChange={setIsShipmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Transporte
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-white">Registrar Nuevo Transporte</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="product" className="text-white">
                            Producto *
                          </Label>
                          <Select
                            value={newShipment.product_id}
                            onValueChange={(value) => setNewShipment({ ...newShipment, product_id: value })}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="origin" className="text-white">
                              Origen *
                            </Label>
                            <Input
                              id="origin"
                              value={newShipment.origin}
                              onChange={(e) => setNewShipment({ ...newShipment, origin: e.target.value })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Ubicación de origen"
                            />
                          </div>
                          <div>
                            <Label htmlFor="destination" className="text-white">
                              Destino *
                            </Label>
                            <Input
                              id="destination"
                              value={newShipment.destination}
                              onChange={(e) => setNewShipment({ ...newShipment, destination: e.target.value })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Ubicación de destino"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="transport_company" className="text-white">
                              Transportista
                            </Label>
                            <Input
                              id="transport_company"
                              value={newShipment.transport_company}
                              onChange={(e) => setNewShipment({ ...newShipment, transport_company: e.target.value })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Empresa de transporte"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quantity" className="text-white">
                              Cantidad *
                            </Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={newShipment.quantity}
                              onChange={(e) => setNewShipment({ ...newShipment, quantity: e.target.value })}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-white">
                            Notas
                          </Label>
                          <Textarea
                            id="notes"
                            value={newShipment.notes}
                            onChange={(e) => setNewShipment({ ...newShipment, notes: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Notas adicionales del envío"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={handleRegisterShipment} className="bg-blue-600 hover:bg-blue-700">
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsShipmentDialogOpen(false)}
                            className="border-slate-600 text-gray-300 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {shipments.map((shipment) => (
                    <Card key={shipment.id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-white">{shipment.product_name}</CardTitle>
                            <CardDescription className="text-gray-400">
                              {shipment.origin} → {shipment.destination}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(shipment.status)}>
                            {getStatusIcon(shipment.status)}
                            <span className="ml-1 capitalize">{shipment.status.replace("_", " ")}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Cantidad:</span>
                            <p className="text-white font-medium">{shipment.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Transportista:</span>
                            <p className="text-white font-medium">{shipment.transport_company || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha:</span>
                            <p className="text-white font-medium">
                              {new Date(shipment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {shipment.status === "in_transit" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateShipmentStatus(shipment.id, "delivered")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Marcar Entregado
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateShipmentStatus(shipment.id, "cancelled")}
                                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                                >
                                  Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        {shipment.notes && (
                          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-300">{shipment.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Transfers Tab */}
              <TabsContent value="transfers" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Transferencias de Productos</h2>
                  <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Transferir Producto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-white">Transferir Producto</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="transfer_product" className="text-white">
                            Producto *
                          </Label>
                          <Select
                            value={newTransfer.product_id}
                            onValueChange={(value) => setNewTransfer({ ...newTransfer, product_id: value })}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="to_user" className="text-white">
                            Receptor *
                          </Label>
                          <Select
                            value={newTransfer.to_user_email}
                            onValueChange={(value) => setNewTransfer({ ...newTransfer, to_user_email: value })}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Seleccionar receptor" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.email}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="transfer_quantity" className="text-white">
                            Cantidad *
                          </Label>
                          <Input
                            id="transfer_quantity"
                            type="number"
                            value={newTransfer.quantity}
                            onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="0"
                          />
                        </div>

                        <div>
                          <Label htmlFor="transfer_notes" className="text-white">
                            Notas
                          </Label>
                          <Textarea
                            id="transfer_notes"
                            value={newTransfer.notes}
                            onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Notas adicionales de la transferencia"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button onClick={handleTransferProduct} className="bg-blue-600 hover:bg-blue-700">
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsTransferDialogOpen(false)}
                            className="border-slate-600 text-gray-300 bg-transparent"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {transfers.map((transfer) => (
                    <Card key={transfer.id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-white">{transfer.product_name}</CardTitle>
                            <CardDescription className="text-gray-400">
                              {transfer.from_user_name} → {transfer.to_user_name}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(transfer.status)}>
                            {getStatusIcon(transfer.status)}
                            <span className="ml-1 capitalize">{transfer.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Cantidad:</span>
                            <p className="text-white font-medium">{transfer.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Fecha:</span>
                            <p className="text-white font-medium">
                              {new Date(transfer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <p className="text-white font-medium capitalize">{transfer.status}</p>
                          </div>
                        </div>
                        {transfer.notes && (
                          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-300">{transfer.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Productos en Custodia</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                            <CardDescription className="text-gray-400">{product.category}</CardDescription>
                          </div>
                          <Badge variant="outline" className="border-blue-600 text-blue-400">
                            En Custodia
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Productor:</span>
                            <p className="text-white font-medium">{product.producer_name}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Descripción:</span>
                            <p className="text-white">{product.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-600 text-gray-300 bg-transparent"
                            onClick={() => router.push(`/products/${product.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h2>
            <p className="text-gray-400">No tienes permisos para acceder a esta página.</p>
          </div>
        )}
      </main>
    </div>
  )
}
