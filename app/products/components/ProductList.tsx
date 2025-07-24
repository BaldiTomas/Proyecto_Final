"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Package, Eye, Trash2, Filter as FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductEditDialog } from "./ProductEditDialog";
import type { ProductWithProducer } from "../../types";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = [
  { value: "all", label: "Todas" },
  { value: "Alimentos", label: "Alimentos" },
  { value: "Farmaceutica", label: "Farmaceutica" },
  { value: "Electronica", label: "Electronica" },
  { value: "Arte", label: "Arte" },
  { value: "Otros", label: "Otros" },
];

const STATUS_LABELS: Record<string, string> = {
  delivered: "En custodia",
  in_transit: "En tránsito",
  cancelled: "Cancelado",
  default: "Sin envío",
};

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-green-900/30 text-green-400 border border-green-600",
  in_transit: "bg-yellow-900/30 text-yellow-400 border border-yellow-600",
  cancelled: "bg-red-900/30 text-red-400 border border-red-600",
  default: "bg-slate-700/30 text-gray-400 border border-gray-500",
};

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "delivered", label: "En custodia" },
  { value: "in_transit", label: "En tránsito" },
  { value: "cancelled", label: "Cancelado" },
  { value: "default", label: "Sin envío" },
];

const STOCK_OPTIONS = [
  { value: "none", label: "Sin ordenar" },
  { value: "desc", label: "Más stock primero" },
  { value: "asc", label: "Menos stock primero" },
];

interface ProductListProps {
  products: ProductWithProducer[];
  loading: boolean;
  userRole: string;
  onDeleteProduct: (id: number) => void;
  onSelectProduct: (product: ProductWithProducer) => void;
  onUpdateProduct: (payload: Partial<ProductWithProducer> & { id: number }) => void;
}

export function ProductList({
  products,
  loading,
  userRole,
  onDeleteProduct,
  onSelectProduct,
  onUpdateProduct,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    stock: "none" as "none" | "asc" | "desc",
  });

  const dedupedProducts = useMemo(() => {
    const map = new Map<number, ProductWithProducer>();
    products.forEach((p) => {
      if (map.has(p.id)) {
        const existing = map.get(p.id)!;
        existing.stock = String(Number(existing.stock) + Number(p.stock));
      } else {
        map.set(p.id, { ...p });
      }
    });
    return Array.from(map.values());
  }, [products]);

  function handleFilterChange<T extends keyof typeof filters>(
    key: T,
    value: typeof filters[T]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }
  function clearFilters() {
    setFilters({ category: "all", status: "all", stock: "none" });
  }

  let filtered = dedupedProducts.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.producer_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.category === "all" || p.category === filters.category) &&
      (filters.status === "all" ||
        (filters.status === "default"
          ? !p.shipment_status || !(STATUS_LABELS[p.shipment_status])
          : p.shipment_status === filters.status))
  );
  if (filters.stock === "asc")
    filtered = filtered.slice().sort((a, b) => Number(a.stock) - Number(b.stock));
  if (filters.stock === "desc")
    filtered = filtered.slice().sort((a, b) => Number(b.stock) - Number(a.stock));

  return (
    <section className="space-y-6">
      <section className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-blue-600 text-blue-400 flex items-center gap-2">
              <FilterIcon className="w-4 h-4" />
              Filtros
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-sm space-y-6">
            <DialogHeader>
              <DialogTitle className="text-white">Filtrar Productos</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Estado del Envío</label>
                <Select
                  value={filters.status}
                  onValueChange={(v) => handleFilterChange("status", v)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Categoría</label>
                <Select
                  value={filters.category}
                  onValueChange={(v) => handleFilterChange("category", v)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Ordenar por stock</label>
                <Select
                  value={filters.stock}
                  onValueChange={(val) => handleFilterChange("stock", val as any)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full">
                    <SelectValue placeholder="Sin ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    {STOCK_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => setFiltersOpen(false)}
                >
                  Aplicar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-600 text-gray-300"
                  onClick={() => {
                    clearFilters();
                    setFiltersOpen(false);
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, idx) => (
                <Card key={`skeleton-${idx}`} className="bg-slate-800 border-slate-700">
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
          : filtered.map((p) => {
              const statusKey =
                p.shipment_status && STATUS_LABELS[p.shipment_status]
                  ? p.shipment_status
                  : "default";

              return (
                <Card
                  key={p.id}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`self-start mb-2 px-2 py-1 rounded text-xs font-semibold ${
                            STATUS_STYLES[statusKey]
                          }`}
                        >
                          {STATUS_LABELS[statusKey]}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Package className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white">{p.name}</CardTitle>
                            <CardDescription className="text-sm text-gray-400">
                              {p.producer_name ?? "Sin productor"}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 mb-4">{p.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Creado: {p.created_at?.split("T")[0] ?? "-"}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onSelectProduct(p)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(userRole === "producer" || userRole === "admin") && (
                          <>
                            <ProductEditDialog
                              product={p}
                              userRole={userRole}
                              onUpdate={onUpdateProduct}
                              onClose={() => {}}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteProduct(p.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </section>
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-white">No se encontraron productos</h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Intenta ajustar tus términos de búsqueda"
              : "Comienza agregando tu primer producto"}
          </p>
        </div>
      )}
    </section>
  );
}
