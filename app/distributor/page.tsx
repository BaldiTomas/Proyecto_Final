// app/distributor/page.tsx
"use client";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { getShipmentContract } from "@/lib/ShipmentRegistrationContract";
import { useAuthStore } from "@/stores/auth-store";
import { useWeb3Store } from "@/stores/web3-store";
import { Navbar } from "@/components/layout/navbar";
import { Shield, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PurchasesTab from "./components/PurchasesTab";
import ShipmentsTab from "./components/ShipmentsTab";
import { toast } from "sonner";
import type {Product,Shipment,Transaction,NewShipmentData,ShipmentStatus,} from "../types";

export default function DistributorPage() {
  const { user, token } = useAuthStore();
  const { isConnected } = useWeb3Store();

  const [products, setProducts] = useState<Product[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  async function loadInitialData() {
    setLoading(true);
    setError(null);
    if (!user || !token) {
      setLoading(false);
      return;
    }
    try {
      const [prodRes, purRes, shRes] = await Promise.all([
        fetch(`${API}/distributor/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/distributor/purchases?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/distributor/shipments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!prodRes.ok || !purRes.ok || !shRes.ok) {
        throw new Error("Error en alguna petición de datos");
      }
      const prodJson = await prodRes.json();
      const purJson = await purRes.json();
      const shJson = await shRes.json();
      setProducts(prodJson.products);
      setPurchases(purJson.purchases);
      setShipments(shJson.shipments);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "distributor" && token) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleRegisterShipment = async (data: NewShipmentData) => {
    if (!token) {
      toast.error("No autenticado");
      return;
    }
    if (!isConnected) {
      toast.error("Conecta tu wallet primero");
      return;
    }
    try {
      data.transportCompany = user!.name;

      const quantityInt = Number.isInteger(data.quantity)
        ? data.quantity
        : Math.floor(Number(data.quantity));

      const contract = await getShipmentContract();
      const tx = await contract.createShipment(
        data.productId,
        data.origin,
        data.destination,
        data.transportCompany,
        quantityInt,
        data.notes
      );
      toast.success("Envío registrado en cadena");

      const res = await fetch(`${API}/distributor/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          quantity: quantityInt,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error creando envío en API");
      }
      toast.success("Envío registrado en base de datos");
      await loadInitialData();
    } catch (e: any) {
      console.error("handleRegisterShipment error:", e);
      toast.error(e.message);
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: ShipmentStatus
  ): Promise<void> => {
    if (!token) {
      toast.error("No autenticado");
      return;
    }
    if (!isConnected) {
      toast.error("Conecta tu wallet primero");
      return;
    }
    try {
      const statusMap: Record<ShipmentStatus, number> = {
        pending: 0,
        in_transit: 1,
        delivered: 2,
        cancelled: 3,
      };

      const statusIndex = statusMap[status];
      if (statusIndex === undefined) {
        toast.error("Estado inválido");
        return;
      }

      const contract = await getShipmentContract();
      const tx = await contract.updateStatus(id, statusIndex);
      toast.success(`Estado actualizado en blockchain: ${status}`);

      const res = await fetch(`${API}/distributor/shipments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error actualizando estado en API");
      }
      toast.success(`Envío ${id} actualizado en base de datos`);
      await loadInitialData();
    } catch (e: any) {
      console.error("handleUpdateStatus error:", e);
      toast.error(e.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Cargando…</p>
      </div>
    );
  if (error || user?.role !== "distributor")
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Shield className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-red-500">{error || "Acceso denegado"}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl text-white">Panel de Distribuidor</h1>
          <Badge className="bg-slate-700 text-gray-300">
            <Truck className="w-4 h-4 mr-1" /> Distribuidor
          </Badge>
        </div>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList className="grid grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="purchases">Compras</TabsTrigger>
            <TabsTrigger value="shipments">Envíos</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <PurchasesTab
              purchases={purchases}
              onConfirmShipment={handleRegisterShipment}
            />
          </TabsContent>

          <TabsContent value="shipments">
            <ShipmentsTab
              products={products}
              shipments={shipments}
              isConnected={isConnected}
              onRegister={handleRegisterShipment}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
