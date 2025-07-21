"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Navbar } from "@/components/layout/navbar";
import { toast } from "sonner";
import BuyForm from "./components/BuyForm";
import SellForm from "./components/SellForm";
import { Product, User } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
const USER_ENDPOINT = `${API_BASE}/admin/users`;

export default function SalesPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push("/login");
      return;
    }
    if (!["seller", "admin", "producer"].includes(user.role)) {
      toast.error("Acceso denegado");
      router.push("/dashboard");
      return;
    }
    loadData();
  }, [user, token]);

  async function loadData() {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      const [pRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/products?custody_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(USER_ENDPOINT, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!pRes.ok || !uRes.ok) throw new Error("Error cargando datos");
      const pJson = await pRes.json();
      const uJson = await uRes.json();
      setProducts(pJson.products || []);
      setUsers(uJson.users || []);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Cargando...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-500">
        {error}
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        No autenticado
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-1">Compras y Ventas</h1>
        <p className="text-gray-400 mb-6">
          Registra nuevas compras y ventas de productos
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <BuyForm
            apiBase={API_BASE}
            user={user}
            token={token ?? ""}
            users={users}
            reloadData={loadData}
          />
          <SellForm
            apiBase={API_BASE}
            user={user}
            token={token ?? ""}
            users={users}
            products={products}
            reloadData={loadData}
          />
        </div>
      </main>
    </div>
  );
}
