"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Package, Search, Plus, Eye, Edit, Trash2, Filter } from "lucide-react"

type ProductType = {
  id: number
  name: string
  description: string
  producer: string
  status: string
  createdAt: string
  category: string
}

export default function ProductsPage() {
  const router = useRouter()
  const { user }: { user: { name: string; role: string } | null } = useAuthStore()
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "",
  })

  const mockProducts: ProductType[] = [
    {
      id: 1,
      name: "Pintura Original — 'Amanecer en el Río'",
      description: "Obra de arte al óleo sobre lienzo, realizada por artista argentino emergente.",
      producer: "Estudio ArteSur",
      status: "verified",
      createdAt: "2024-05-22",
      category: "Obra de Arte",
    },
    {
      id: 2,
      name: "La Noche Estrellada — Vincent van Gogh",
      description: "Pintura al óleo famosa por su estilo postimpresionista y su expresión emocional.",
      producer: "Museo de Arte Moderno (MoMA)",
      status: "verified",
      createdAt: "2024-05-01",
      category: "Obra de Arte",
    },
    {
      id: 3,
      name: "Escultura en Mármol — 'Equilibrio'",
      description: "Escultura contemporánea en mármol blanco de Carrara.",
      producer: "Taller Fusión Arte",
      status: "verified",
      createdAt: "2024-05-18",
      category: "Obra de Arte",
    },
    {
      id: 4,
      name: "Vacuna Antigripal Tetravalente",
      description: "Vacuna recomendada por la OMS para la temporada 2024.",
      producer: "BioImmuni S.A.",
      status: "pending",
      createdAt: "2024-05-16",
      category: "Producto Médico",
    },
    {
      id: 5,
      name: "Penicilina G",
      description: "Antibiótico descubierto por Alexander Fleming, revolucionó la medicina moderna.",
      producer: "GlaxoSmithKline",
      status: "verified",
      createdAt: "2024-04-26",
      category: "Medicamento",
    },
  ];


  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-900/20 text-green-400 border-green-600"
      case "pending":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-600"
      case "rejected":
        return "bg-red-900/20 text-red-400 border-red-600"
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Verificado"
      case "pending":
        return "Pendiente"
      case "rejected":
        return "Rechazado"
      default:
        return status
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.producer?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.description || !newProduct.category) {
      toast.error("Por favor completa todos los campos")
      return
    }

    const product: ProductType = {
      id: products.length + 1,
      ...newProduct,
      producer: user?.name || "Usuario",
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setProducts([...products, product])
    setNewProduct({ name: "", description: "", category: "" })
    setIsCreateDialogOpen(false)
    toast.success("Producto creado exitosamente")
  }

  const handleViewProduct = (product: ProductType) => {
    setSelectedProduct(product)
  }

  const handleEditProduct = (product: ProductType) => {
    toast.info("Función de edición en desarrollo")
  }

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter((p) => p.id !== productId))
    toast.success("Producto eliminado")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Productos</h1>
              <p className="text-gray-400 mt-1">Gestiona y rastrea tus productos de la cadena de suministro</p>
            </div>

            {(user.role === "producer" || user.role === "admin") && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Producto
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Crear Nuevo Producto</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Nombre del Producto</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ingresa el nombre del producto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-white">Descripción</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Describe el producto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-white">Categoría</Label>
                      <Input
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ej: Alimentos, Bebidas, etc."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleCreateProduct} className="bg-blue-600 hover:bg-blue-700">
                        Crear Producto
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-600 text-gray-300">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-600 text-gray-300 bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-slate-700 rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-3 w-full mb-2 bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-slate-700 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              : filteredProducts.map((product) => (
                  <Card key={product.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Package className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-400">{product.producer}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(product.status)}>{getStatusLabel(product.status)}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-300 mb-4">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Creado: {product.createdAt}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewProduct(product)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(user.role === "producer" || user.role === "admin") && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No se encontraron productos</h3>
              <p className="text-gray-400">
                {searchTerm ? "Intenta ajustar tus términos de búsqueda" : "Comienza agregando tu primer producto"}
              </p>
            </div>
          )}
        </div>
      </main>

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Productor</Label>
                <p className="text-gray-300">{selectedProduct.producer}</p>
              </div>
              <div>
                <Label className="text-white">Descripción</Label>
                <p className="text-gray-300">{selectedProduct.description}</p>
              </div>
              <div>
                <Label className="text-white">Estado</Label>
                <Badge className={getStatusColor(selectedProduct.status)}>
                  {getStatusLabel(selectedProduct.status)}
                </Badge>
              </div>
              <div>
                <Label className="text-white">Fecha de Creación</Label>
                <p className="text-gray-300">{selectedProduct.createdAt}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
