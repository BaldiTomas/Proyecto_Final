"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileText, Download, Loader2, Package, BarChart3 } from "lucide-react";
import {
  generateProductReport,
  downloadReport,
  getReportFilename,
  type ReportOptions,
} from "@/lib/report-utils";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  producer_name: string;
  origin: string;
  created_at: string;
  history?: any[];
}

interface Transaction {
  id: number;
  product_id: number;
  seller_name: string;
  buyer_name: string;
  quantity: number;
  status: string;
  created_at: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includeTransactions: true,
    includeOwnershipHistory: true,
    includeProductDetails: true,
    includeQRCode: false,
  });

  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Pintura Original — 'Amanecer en el Río'",
        description:
          "Obra de arte al óleo sobre lienzo, realizada por artista argentino emergente.",
        category: "Obra de Arte",
        producer_name: "Estudio ArteSur",
        origin: "Argentina",
        created_at: "2024-05-22T10:00:00Z",
        history: [
          {
            id: 1,
            timestamp: "2024-05-22T10:00:00Z",
            actor_name: "Estudio ArteSur",
            action: "created",
            location: "Taller ArteSur",
            notes: "Obra registrada en el sistema",
          },
        ],
      },
      {
        id: 2,
        name: "La Noche Estrellada — Vincent van Gogh",
        description:
          "Pintura al óleo famosa por su estilo postimpresionista y su expresión emocional.",
        category: "Obra de Arte",
        producer_name: "Museo de Arte Moderno (MoMA)",
        origin: "Países Bajos",
        created_at: "2024-05-01T09:00:00Z",
        history: [
          {
            id: 2,
            timestamp: "2024-05-01T09:00:00Z",
            actor_name: "MoMA",
            action: "catalogued",
            location: "Nueva York",
            notes: "Obra agregada a colección permanente",
          },
        ],
      },
      {
        id: 3,
        name: "Escultura en Mármol — 'Equilibrio'",
        description: "Escultura contemporánea en mármol blanco de Carrara.",
        category: "Obra de Arte",
        producer_name: "Taller Fusión Arte",
        origin: "Italia",
        created_at: "2024-05-18T11:30:00Z",
        history: [
          {
            id: 3,
            timestamp: "2024-05-18T11:30:00Z",
            actor_name: "Taller Fusión Arte",
            action: "created",
            location: "Fusión Estudio",
            notes: "Escultura terminada y registrada",
          },
        ],
      },
      {
        id: 4,
        name: "Vacuna Antigripal Tetravalente",
        description: "Vacuna recomendada por la OMS para la temporada 2024.",
        category: "Producto Médico",
        producer_name: "BioImmuni S.A.",
        origin: "Argentina",
        created_at: "2024-05-16T08:45:00Z",
        history: [
          {
            id: 4,
            timestamp: "2024-05-16T08:45:00Z",
            actor_name: "BioImmuni S.A.",
            action: "produced",
            location: "Planta BioImmuni",
            notes: "Lote preparado para distribución",
          },
        ],
      },
      {
        id: 5,
        name: "Penicilina G",
        description:
          "Antibiótico descubierto por Alexander Fleming, revolucionó la medicina moderna.",
        category: "Medicamento",
        producer_name: "GlaxoSmithKline",
        origin: "Reino Unido",
        created_at: "2024-04-26T07:20:00Z",
        history: [
          {
            id: 5,
            timestamp: "2024-04-26T07:20:00Z",
            actor_name: "GlaxoSmithKline",
            action: "catalogued",
            location: "Centro GSK Londres",
            notes: "Producto registrado en inventario",
          },
        ],
      },
    ];

    const mockTransactions: Transaction[] = [
      {
        id: 1,
        product_id: 1,
        seller_name: "Estudio ArteSur",
        buyer_name: "Galería Alma Libre",
        quantity: 1,
        status: "completed",
        created_at: "2024-05-23T15:00:00Z",
      },
      {
        id: 2,
        product_id: 2,
        seller_name: "Museo de Arte Moderno (MoMA)",
        buyer_name: "Coleccionista Privado — París",
        quantity: 1,
        status: "completed",
        created_at: "2024-05-05T10:45:00Z",
      },
      {
        id: 3,
        product_id: 3,
        seller_name: "Taller Fusión Arte",
        buyer_name: "Fundación Escultórica Argentina",
        quantity: 1,
        status: "pending",
        created_at: "2024-05-20T12:30:00Z",
      },
      {
        id: 4,
        product_id: 4,
        seller_name: "BioImmuni S.A.",
        buyer_name: "Red de Hospitales Provinciales",
        quantity: 1500,
        status: "completed",
        created_at: "2024-05-18T09:15:00Z",
      },
      {
        id: 5,
        product_id: 5,
        seller_name: "GlaxoSmithKline",
        buyer_name: "Farmacias del Sur",
        quantity: 300,
        status: "pending",
        created_at: "2024-04-28T08:00:00Z",
      },
    ];

    setProducts(mockProducts);
    setTransactions(mockTransactions);
  }, []);

  const handleOptionChange = (
    option: keyof ReportOptions,
    checked: boolean
  ) => {
    setReportOptions((prev) => ({
      ...prev,
      [option]: checked,
    }));
  };

  const generateReport = async () => {
    if (!selectedProductId) {
      toast.error("Por favor selecciona un producto para generar el reporte.");
      return;
    }

    setIsGenerating(true);
    try {
      toast.info("Generando reporte...", {
        description: "Recopilando información del producto...",
      });

      // Get product data
      const productId = Number.parseInt(selectedProductId);
      const product = products.find((p) => p.id === productId);

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // Get transactions for this product
      const productTransactions = transactions.filter(
        (tx) => tx.product_id === productId
      );

      // Prepare report data
      const reportData = {
        product,
        transactions: productTransactions,
        reportGeneratedBy: `${user?.name} - TrackChain`,
        reportGeneratedAt: Math.floor(Date.now() / 1000),
      };

      // Generate PDF
      const pdfBlob = generateProductReport(reportData, reportOptions);
      const filename = getReportFilename(product);

      // Download the report
      downloadReport(pdfBlob, filename);

      toast.success("Reporte generado exitosamente", {
        description: `El reporte de "${product.name}" se ha descargado.`,
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast.error("Error al generar reporte", {
        description:
          error.message || "No se pudo generar el reporte. Inténtalo de nuevo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Generador de Reportes
              </h1>
              <p className="text-gray-400 mt-1">
                Genera reportes detallados de trazabilidad de productos
              </p>
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
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
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
                  <Label className="text-sm font-medium text-white">
                    Incluir en el reporte:
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="product-details"
                        checked={reportOptions.includeProductDetails}
                        onCheckedChange={(checked) =>
                          handleOptionChange(
                            "includeProductDetails",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="product-details"
                        className="text-sm text-gray-300"
                      >
                        Detalles del producto
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ownership-history"
                        checked={reportOptions.includeOwnershipHistory}
                        onCheckedChange={(checked) =>
                          handleOptionChange(
                            "includeOwnershipHistory",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="ownership-history"
                        className="text-sm text-gray-300"
                      >
                        Historial de trazabilidad
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="transactions"
                        checked={reportOptions.includeTransactions}
                        onCheckedChange={(checked) =>
                          handleOptionChange(
                            "includeTransactions",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="transactions"
                        className="text-sm text-gray-300"
                      >
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
                <CardDescription className="text-gray-400">
                  Información del producto seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProductId ? (
                  (() => {
                    const product = products.find(
                      (p) => p.id === Number.parseInt(selectedProductId)
                    );
                    if (!product)
                      return (
                        <p className="text-gray-400">Producto no encontrado</p>
                      );

                    const productTransactions = transactions.filter(
                      (tx) => tx.product_id === product.id
                    );

                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-700/50 rounded-lg">
                          <h3 className="font-semibold text-lg mb-2 text-white">
                            {product.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">ID:</span>
                              <span className="text-white ml-1">
                                #{product.id}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Categoría:</span>
                              <span className="text-white ml-1">
                                {product.category}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Productor:</span>
                              <span className="text-white ml-1">
                                {product.producer_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">
                                Transacciones:
                              </span>
                              <span className="text-white ml-1">
                                {productTransactions.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm">
                          <p className="text-gray-300">
                            <strong className="text-white">Descripción:</strong>{" "}
                            {product.description}
                          </p>
                          <p className="text-gray-300 mt-2">
                            <strong className="text-white">Origen:</strong>{" "}
                            {product.origin}
                          </p>
                        </div>

                        {productTransactions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-white">
                              Últimas Transacciones:
                            </h4>
                            <div className="space-y-2">
                              {productTransactions.slice(-3).map((tx) => (
                                <div
                                  key={tx.id}
                                  className="text-xs p-2 bg-slate-700/30 rounded"
                                >
                                  <div className="font-medium text-white">
                                    #{tx.id} - {tx.status}
                                  </div>
                                  <div className="text-gray-400">
                                    {tx.seller_name} → {tx.buyer_name}
                                  </div>
                                  <div className="text-gray-400">
                                    Cantidad: {tx.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {product.history && product.history.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 text-white">
                              Historial de Trazabilidad:
                            </h4>
                            <div className="space-y-2">
                              {product.history.slice(-3).map((entry) => (
                                <div
                                  key={entry.id}
                                  className="text-xs p-2 bg-slate-700/30 rounded"
                                >
                                  <div className="font-medium text-white">
                                    {entry.action}
                                  </div>
                                  <div className="text-gray-400">
                                    {entry.actor_name} - {entry.location}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">
                      Selecciona un producto para ver la vista previa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
