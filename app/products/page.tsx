// app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Navbar } from "@/components/layout/navbar";
import { toast } from "sonner";
import { ProductList } from "./components/ProductList";
import { ProductCreateDialog } from "./components/ProductCreateDialog";
import { ProductDetailsDialog } from "./components/ProductDetailsDialog";
import { setProductActiveOnChain } from "../../lib/contracts";

interface Product {
  id: number;
  name: string;
  stock: number;
  description: string;
  category: string;
  producer_name: string;
  origin: string;
  production_date: string;
  blockchain_hash: string | null;
  metadata_hash: string | null;
  current_custody_id: number | null;
  is_active: boolean;
  status?: string;
  created_at?: string;
}

interface NewProduct {
  name: string;
  description: string;
  category: string;
  origin: string;
  production_date: string;
  stock: number;
}

export default function ProductsPage() {
  const { user, token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products);
    } catch {
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  if (!user) return null;

const handleDeleteProduct = async (id: number) => {
    if (!token) {
      toast.error("No autenticado");
      return;
    }
    try {
      // 1) On‑chain
      await setProductActiveOnChain(id, false);
      toast.success("Producto marcado inactivo en blockchain");

      // 2) Backend (soft‑delete)
      const res = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al marcar inactivo en BD");
      }

      setProducts((p) => p.filter((prod) => prod.id !== id));
      toast.success("Producto marcado inactivo en base de datos");
    } catch (err: any) {
      console.error("Error al eliminar producto:", err);
      toast.error("Error al eliminar producto: " + err.message);
    }
  };


  const handleCreateProduct = async (
    np: NewProduct & { blockchain_hash: string; metadata_hash: string }
  ) => {
    try {
      const payload = {
        ...np,
        producer_id: user.id,
        blockchain_hash: np.blockchain_hash,
        metadata_hash: np.metadata_hash,
        current_custody_id: user.id,
        is_active: true,
      };
      const res = await fetch("http://localhost:3001/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const { product } = await res.json();
      setProducts((prev) => [product, ...prev]);
      toast.success("Producto creado con éxito");
    } catch {
      toast.error("Error al crear producto");
    }
  };

  const handleUpdateProduct = async (
    upd: Partial<Product> & { id: number }
  ) => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${upd.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(upd),
      });
      if (!res.ok) throw new Error();
      await res.json();
      toast.success("Producto actualizado");
      await fetchProducts();
    } catch {
      toast.error("Error al actualizar producto");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Productos</h1>
            <p className="text-gray-400 mt-1">
              Gestiona y rastrea tus productos de la cadena de suministro
            </p>
          </div>
          {/* Ahora pasamos userRole y onCreate */}
          <ProductCreateDialog
            userRole={user.role}
            onCreate={handleCreateProduct}
          />
        </header>

        <ProductList
          products={products}
          loading={loading}
          userRole={user.role}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
          onSelectProduct={setSelectedProduct}
        />

        <ProductDetailsDialog
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </main>
    </div>
  );
}
