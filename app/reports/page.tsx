// app/reports/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent,} from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2, Package, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { generateProductReport, downloadReport, getReportFilename, type ReportOptions,} from "@/lib/report-utils";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  producer_name: string;
  origin: string;
  created_at: string;
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
  const { user, token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    includeProductDetails: true,
    includeOwnershipHistory: true,
    includeTransactions: true,
    includeQRCode: false,
  });

  const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [pRes, tRes] = await Promise.all([
          fetch(`${API}/products`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!pRes.ok || !tRes.ok) throw new Error("Error cargando datos");
        const pJson = await pRes.json();
        const tJson = await tRes.json();
        const uniqueProducts = (pJson.products || pJson).filter(
          (prod: Product, idx: number, arr: Product[]) =>
            arr.findIndex((p) => p.id === prod.id) === idx
        );

        setProducts(uniqueProducts);
        setTransactions(tJson.transactions || tJson);
      } catch (err: any) {
        toast.error("No se pudieron cargar productos o transacciones");
        console.error(err);
      }
    })();
  }, [token]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === Number(selectedProductId)),
    [products, selectedProductId]
  );

  const productTransactions = useMemo(
    () => transactions.filter((tx) => tx.product_id === Number(selectedProductId)),
    [transactions, selectedProductId]
  );

  const handleOptionChange = (key: keyof ReportOptions, checked: boolean) =>
    setReportOptions((opts) => ({ ...opts, [key]: checked }));

  const generateReport = async () => {
    if (!selectedProduct) {
      return toast.error("Selecciona un producto primero");
    }
    setIsGenerating(true);
    try {
      toast.info("Generando reporte...", {
        description: `Procesando "${selectedProduct.name}"…`,
      });

      const reportData = {
        product: selectedProduct,
        transactions: productTransactions,
        reportGeneratedBy: `${user?.name} - TrackChain`,
        reportGeneratedAt: Math.floor(Date.now() / 1000),
      };

      const pdfBlob = generateProductReport(reportData, reportOptions);
      const filename = getReportFilename(selectedProduct);
      downloadReport(pdfBlob, filename);

      toast.success("Reporte descargado", {
        description: `Archivo: ${filename}`,
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Error al generar reporte", {
        description: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Generador de Reportes</h1>
            <p className="text-gray-400">Reportes PDF de trazabilidad</p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-300">Informes</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-blue-400" />
                Configuración
              </CardTitle>
              <CardDescription className="text-gray-400">
                Selecciona producto y opciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product-select" className="text-white">
                  Producto
                </Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{p.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Incluir en reporte:</Label>
                {(
                  [
                    ["includeProductDetails", "Detalles del producto"],
                    ["includeOwnershipHistory", "Historial de trazabilidad"],
                    ["includeTransactions", "Transacciones"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={reportOptions[key]}
                      onCheckedChange={(v) => handleOptionChange(key, v as boolean)}
                    />
                    <Label htmlFor={key} className="text-sm text-gray-300">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>

              <Button
                onClick={generateReport}
                disabled={!selectedProduct || isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando…
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Reporte
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Vista Previa</CardTitle>
              <CardDescription className="text-gray-400">
                Información seleccionada
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedProduct ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">Selecciona un producto</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">
                      {selectedProduct.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>ID: #{selectedProduct.id}</div>
                      <div>Categoría: {selectedProduct.category}</div>
                      <div>Productor: {selectedProduct.producer_name}</div>
                      <div>
                        Transacciones: {productTransactions.length}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300">
                    <strong className="text-white">Descripción:</strong>{" "}
                    {selectedProduct.description}
                  </p>
                  <p className="text-gray-300">
                    <strong className="text-white">Origen:</strong>{" "}
                    {selectedProduct.origin}
                  </p>

                  {productTransactions.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">
                        Últimas Transacciones
                      </h4>
                      <div className="space-y-2 text-gray-300 text-xs">
                        {productTransactions
                          .slice(-3)
                          .map((tx) => (
                            <div key={tx.id} className="p-2 bg-slate-700/30 rounded">
                              #{tx.id} • {tx.status} • {tx.quantity} unidades
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
