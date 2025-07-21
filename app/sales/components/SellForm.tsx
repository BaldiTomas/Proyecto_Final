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
  const [sellPrice, setSellPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [sellNotes, setSellNotes] = useState("");

  const sellOptions = products.filter(
    (p) =>
      (p.custody_user_id === user.id || p.current_custody_id === user.id) && p.stock > 0
  );
  const buyers = users.filter((u) => u.id !== user.id && u.role !== "admin");

  async function handleSell(e: React.FormEvent) {
    e.preventDefault();
    if (!sellProductId || !buyerId || !sellQty || !sellPrice)
      return toast.error("Completa todos los campos de venta");
    if (buyerId === user.id) return toast.error("No puedes vender a ti mismo");

    const prod = products.find(
      (p) =>
        p.id === sellProductId &&
        (p.custody_user_id === user.id || p.current_custody_id === user.id)
    );
    if (!prod) return toast.error("Producto no disponible");
    if (+sellQty > prod.stock) return toast.error(`Solo tienes ${prod.stock} unidades`);

    try {
      await registerSaleOnChain({
        productId: sellProductId,
        toCustodyId: buyerId,
        quantity: +sellQty,
        price: +sellPrice,
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
          quantity: +sellQty,
          price_per_unit: +sellPrice,
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
      setSellPrice("");
      setCurrency("USD");
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
              value={sellQty}
              onChange={(e) => setSellQty(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-200">Precio por Unidad</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-200">Moneda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
              </SelectContent>
            </Select>
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
