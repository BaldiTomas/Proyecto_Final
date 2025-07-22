// app/products/components/ProductList.tsx
"use client";

import { useState } from "react";
import {Card,CardContent,CardDescription,CardHeader,CardTitle,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Package, Eye, Trash2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductEditDialog } from "./ProductEditDialog";
import type { ProductWithProducer } from "../../types";

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

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.producer_name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <section className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
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
          : filtered.map((p, idx) => (
              <Card
                key={`${p.id}-${idx}`}
                className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
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
            ))}
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
