"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { FileText, Download, Loader2, Package, BarChart3 } from "lucide-react"
import { generateProductReport, downloadReport, getReportFilename, type ReportOptions } from "@/lib/report-utils"

interface Product {
  id: number
  name: string
  description: string
  category: string
  producer_name: string
  origin: string
  created_at: string
  history?: any[]
}

interface Transaction {
  id: number
  product_id: number
  seller_name: string
  buyer_name: string
  quantity: number
  status: string
  created_at: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includeTransactions: true,
    includeOwnershipHistory: true,
    includeProductDetails: true,
    includeQRCode: false,
  })

  // Mock data - En un entorno real, esto vendría de la API
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Granos de Café Orgánico",
        description: "Granos de café premium orgánico de Colombia",
        category: "Alimentos",
        producer_name: "Juan Productor",
        origin: "Finca Valle Verde",
        created_at: "2024-01-15T10:30:00Z",
        history: [
          {
            id: 1,
            timestamp: "2024-01-15T10:30:00Z",
            actor_name: "Juan Productor",
            action: "created",
            location: "Finca Valle Verde",
            notes: "Producto registrado en el sistema",
          },
          {
            id: 2,
            timestamp: "2024-01-16T14:20:00Z",
            actor_name: "Carlos Distribuidor",
            action: "transferred",
            location: "Centro de Distribución",
            notes: "Producto transferido para distribución",
          },
        ],
      },
      {
        id: 2,
        name: "Hojas de Té Premium",
        description: "Hojas de té de alta calidad de Sri Lanka",
        category: "Bebidas",
        producer_name: "Juan Productor",
        origin: "Montaña Tea Co.",
        created_at: "2024-01-14T08:15:00Z",
        history: [
          {
            id: 3,
            timestamp: "2024-01-14T08:15:00Z",
            actor_name: "Juan Productor",
            action: "created",
            location: "Plantación Montaña Verde",
            notes: "Producto registrado en el sistema",
          },
        ],
      },
      {
        id: 3,
        name: "Miel Artesanal",
        description: "Miel pura de apicultores locales",
        category: "Alimentos",
        producer_name: "Juan Productor",
        origin: "Miel Dorada Ltda",
        created_at: "2024-01-13T16:45:00Z",
        history: [
          {
            id: 4,
            timestamp: "2024-01-13T16:45:00Z",
            actor_name: "Juan Productor",
            action: "created",
            location: "Apiario Local",
            notes: "Producto registrado en el sistema",
          },
        ],
      },
    ]

    const mockTransactions: Transaction[] = [
      {
        id: 1,
        product_id: 1,
        seller_name: "Juan Productor",
        buyer_name: "María Vendedora",
        quantity: 50,
        status: "completed",
        created_at: "2024-01-16T10:00:00Z",
      },
      {
        id: 2,
        product_id: 2,
        seller_name: "Juan Productor",
        buyer_name: "Carlos Distribuidor",
        quantity: 25,
        status: "pending",
        created_at: "2024-01-15T14:30:00Z",
      },
    ]

    setProducts(mockProducts)
    setTransactions(mockTransactions)
  }, [])

  const handleOptionChange = (option: keyof ReportOptions, checked: boolean) => {
    setReportOptions((prev) => ({
      ...prev,
      [option]: checked,
    }))
  }

  const generateReport = async () => {
    if (!selectedProductId) {
      toast.error("Por favor selecciona un producto para generar el reporte.")
      return
    }

    setIsGenerating(true)
    try {
      toast.info("Generando reporte...", { description: "Recopilando información del producto..." })

      // Get product data
      const productId = Number.parseInt(selectedProductId)
      const product = products.find((p) => p.id === productId)

      if (!product) {
        throw new Error("Producto no encontrado")
      }

      // Get transactions for this product
      const productTransactions = transactions.filter((tx) => tx.product_id === productId)

      // Prepare report data
      const reportData = {
        product,
        transactions: productTransactions,
        reportGeneratedBy: `${user?.name} - TrackChain`,
        reportGeneratedAt: Math.floor(Date.now() / 1000),
      }

      // Generate PDF
      const pdfBlob = generateProductReport(reportData, reportOptions)
      const filename = getReportFilename(product)

      // Download the report
      downloadReport(pdfBlob, filename)

      toast.success("Reporte generado exitosamente", {
        description: `El reporte de "${product.name}" se ha descargado.`,
      })
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast.error("Error al generar reporte", {
        description: error.message || "No se pudo generar el reporte. Inténtalo de nuevo.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Generador de Reportes</h1>
              <p className="text-gray-400 mt-1">Genera reportes detallados de trazabilidad de productos</p>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">Reportes PDF</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Configuration Panel */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-blue-400" />
                  Configuración del Reporte
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Selecciona el producto y las opciones para el reporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product-select" className="text-white">
                    Producto
                  </Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-400">
                                ID: #{product.id} • {product.category}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Report Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-white">Incluir en el reporte:</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="product-details"
                        checked={reportOptions.includeProductDetails}
                        onCheckedChange={(checked) => handleOptionChange("includeProductDetails", checked as boolean)}
                      />
                      <Label htmlFor="product-details" className="text-sm text-gray-300">
                        Detalles del producto
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ownership-history"
                        checked={reportOptions.includeOwnershipHistory}
                        onCheckedChange={(checked) => handleOptionChange("includeOwnershipHistory", checked as boolean)}
                      />
                      <Label htmlFor="ownership-history" className="text-sm text-gray-300">
                        Historial de trazabilidad
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="transactions"
                        checked={reportOptions.includeTransactions}
                        onCheckedChange={(checked) => handleOptionChange("includeTransactions", checked as boolean)}
                      />
                      <Label htmlFor="transactions" className="text-sm text-gray-300">
                        Historial de transacciones
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateReport}
                  disabled={!selectedProductId || isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando Reporte...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generar Reporte PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Vista Previa</CardTitle>
                <CardDescription className="text-gray-400">Información del producto seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProductId ? (
                  (() => {
                    const product = products.find((p) => p.id === Number.parseInt(selectedProductId))
                    if (!product) return <p className="text-gray-400">Producto no encontrado</p>

                    const productTransactions = transactions.filter((tx) => tx.product_id === product.id)

                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h3 className="font-semibold text-lg mb-2 text-white">{product.name}</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">ID:</span>
                              <span className="text-white ml-1">#{product.id}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Categoría:</span>
                              <span className="text-white ml-1">{product.category}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Productor:</span>
                              <span className="text-white ml-1">{product.producer_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Transacciones:</span>
                              <span className="text-white ml-1">{productTransactions.length}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="text-gray-300">
                            <strong className="text-white">Descripción:</strong> {product.description}
                          </p>
                          <p className="text-gray-300 mt-2">
                            <strong className="text-white">Origen:</strong> {product.origin}
                          </p>
                        </div>

                        {productTransactions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-white">Últimas Transacciones:</h4>
                            <div className="space-y-2">
                              {productTransactions.slice(-3).map((tx) => (
                                <div key={tx.id} className="text-xs p-2 bg-slate-700/30 rounded">
                                  <div className="font-medium text-white">
                                    #{tx.id} - {tx.status}
                                  </div>
                                  <div className="text-gray-400">
                                    {tx.seller_name} → {tx.buyer_name}
                                  </div>
                                  <div className="text-gray-400">Cantidad: {tx.quantity}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {product.history && product.history.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-white">Historial de Trazabilidad:</h4>
                            <div className="space-y-2">
                              {product.history.slice(-3).map((entry) => (
                                <div key={entry.id} className="text-xs p-2 bg-slate-700/30 rounded">
                                  <div className="font-medium text-white">{entry.action}</div>
                                  <div className="text-gray-400">
                                    {entry.actor_name} - {entry.location}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">Selecciona un producto para ver la vista previa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
