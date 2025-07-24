"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerSaleOnChain } from "@/lib/contracts";
import { Product, User } from "../../types";

interface SellFormProps {
  apiBase: string;
  user: User;
  token: string;
  users: User[];
  products: Product[];
  reloadData: () => void;
}

export default function SellForm({ apiBase, user, token, users, products, reloadData }: SellFormProps) {
  const [sellProductId, setSellProductId] = useState<number>();
  const [buyerId, setBuyerId] = useState<number>();
  const [sellQty, setSellQty] = useState("");
  const [sellNotes, setSellNotes] = useState("");

  const sellOptions = products.filter(
    (p) =>
      (p.custody_user_id === user.id || p.current_custody_id === user.id) && p.stock > 0 && p.shipment_status === "delivered"
  );
  const buyers = users.filter((u) => u.id !== user.id && u.role === "seller");

  const selectedProduct = sellOptions.find((p) => p.id === sellProductId);
  const maxStock = selectedProduct ? selectedProduct.stock : undefined;

  async function handleSell(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(sellQty);

    if (!sellProductId || !buyerId || !sellQty)
      return toast.error("Completa todos los campos de venta");
    if (buyerId === user.id) return toast.error("No puedes vender a ti mismo");

    if (isNaN(qty) || qty < 1) {
      return toast.error("La cantidad debe ser mayor a cero.");
    }
    if (selectedProduct && qty > selectedProduct.stock) {
      return toast.error(`Solo tienes ${selectedProduct.stock} unidades disponibles para vender.`);
    }

    const prod = sellOptions.find(
      (p) =>
        p.id === sellProductId &&
        (p.custody_user_id === user.id || p.current_custody_id === user.id)
    );
    if (!prod) return toast.error("Producto no disponible");

    const price = selectedProduct?.price ?? 0;

    try {
      await registerSaleOnChain({
        productId: sellProductId,
        toCustodyId: buyerId,
        quantity: qty,
        price: +price,
      });
      toast.success("Venta registrada en blockchain");
    } catch (err: any) {
      console.error("Error on-chain:", err);
      return toast.error("Error al registrar on-chain: " + err.message);
    }

    try {
      const res = await fetch(`${apiBase}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: sellProductId,
          buyer_email: users.find((u) => u.id === buyerId)?.email,
          quantity: qty,
          price_per_unit: +price,
          location: "",
          notes: sellNotes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Venta fallida");
      }
      const { message } = await res.json();
      toast.success(message);
      setSellProductId(undefined);
      setBuyerId(undefined);
      setSellQty("");
      setSellNotes("");
      reloadData();
    } catch (e: any) {
      console.error("Error API:", e);
      toast.error("Error al guardar la venta: " + e.message);
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg text-white">Registrar Venta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSell} className="space-y-4">
          <div>
            <Label className="text-gray-200">Producto</Label>
            <Select value={sellProductId?.toString() || ""} onValueChange={(v) => setSellProductId(+v)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Selecciona un producto" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {sellOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name} (Stock: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-200">Comprador</Label>
            <Select value={buyerId?.toString() || ""} onValueChange={(v) => setBuyerId(+v)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Selecciona un comprador" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {buyers.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-200">Cantidad</Label>
            <Input
              type="number"
              min={1}
              max={maxStock}
              value={sellQty}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setSellQty(val);
                }
              }}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder={
                maxStock !== undefined
                  ? `Máx: ${maxStock}`
                  : "Ingrese cantidad"
              }
              disabled={!selectedProduct}
            />
            {selectedProduct && (
              <div className="text-xs text-gray-400 mt-1">
                Stock disponible: {selectedProduct.stock}
              </div>
            )}
          </div>
          <div>
            <Label className="text-gray-200">Precio Unitario (USD)</Label>
            <div className="bg-slate-700 border-slate-600 text-white px-3 py-2 rounded">
              {selectedProduct
                ? `$${Number(selectedProduct.price).toFixed(2)}`
                : "-"}
            </div>
          </div>
          <div>
            <Label className="text-gray-200">Notas</Label>
            <Input
              value={sellNotes}
              onChange={(e) => setSellNotes(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Vender
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
