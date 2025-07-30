// app/sales/components/BuyForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buyProductOnChain } from "@/lib/contracts";
import { Product, User } from "../../types";

interface BuyFormProps {
  apiBase: string;
  user: User;
  token: string;
  users: User[];
  reloadData: () => void;
}

export default function BuyForm({
  apiBase,
  user,
  token,
  users,
  reloadData,
}: BuyFormProps) {
  const [producerId, setProducerId] = useState<number>();
  const [producerProducts, setProducerProducts] = useState<Product[]>([]);
  const [buyProductId, setBuyProductId] = useState<number>();
  const [buyQty, setBuyQty] = useState("");
  const [buyNotes, setBuyNotes] = useState("");

  useEffect(() => {
    if (!producerId) {
      setProducerProducts([]);
      setBuyProductId(undefined);
      return;
    }
    fetch(`${apiBase}/products?custody_id=${producerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        setProducerProducts(j.products || []);
        setBuyProductId(undefined);
      })
      .catch(() => setProducerProducts([]));
  }, [producerId, apiBase, token]);

  const producers = users.filter((u) => u.role === "producer");
  const selectedProduct = producerProducts.find((p) => p.id === buyProductId);
  const maxStock = selectedProduct ? selectedProduct.stock : undefined;

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(buyQty);

    // Validaciones básicas
    if (!producerId || !buyProductId || !buyQty) {
      return toast.error("Completa todos los campos de compra");
    }
    if (producerId === user.id) {
      return toast.error("No puedes comprar a ti mismo");
    }
    if (isNaN(qty) || qty < 1) {
      return toast.error("La cantidad debe ser mayor a cero.");
    }
    if (selectedProduct && qty > selectedProduct.stock) {
      return toast.error(
        `No puedes comprar más de ${selectedProduct.stock} unidades de este producto.`
      );
    }

    const price = selectedProduct?.price ?? 0;

    let blockchainHash: string;
    try {
      // 1) Llamada on-chain
      const receipt = await buyProductOnChain({
        productId: buyProductId,
        toCustodyId: user.id,
        quantity: qty,
        price: +price,
      });
      // Sólo guardamos el hash (0x...)
      blockchainHash = receipt.transactionHash;
      toast.success("Compra registrada en blockchain");
    } catch (err: any) {
      console.error("Error on-chain:", err);
      return toast.error(
        "Error al registrar la compra on-chain: " + err.message
      );
    }

    try {
      // 2) Guardar en nuestro backend, incluyendo blockchain_hash
      const res = await fetch(`${apiBase}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: buyProductId,
          seller_id: producerId,
          buyer_email: user.email,
          quantity: qty,
          price_per_unit: +price,
          location: "",
          notes: buyNotes,
          blockchain_hash: blockchainHash,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Compra fallida");
      }
      const { message } = await res.json();
      toast.success(message);

      // Limpiar formulario y recargar lista
      setProducerId(undefined);
      setProducerProducts([]);
      setBuyProductId(undefined);
      setBuyQty("");
      setBuyNotes("");
      reloadData();
    } catch (e: any) {
      console.error("Error API:", e);
      toast.error("Error al guardar la compra: " + e.message);
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg text-white">Registrar Compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleBuy} className="space-y-4">
          <div>
            <Label className="text-gray-200">Productor</Label>
            <Select
              value={producerId?.toString() || ""}
              onValueChange={(v) => setProducerId(+v)}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Selecciona un productor" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {producers.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-200">Producto</Label>
            <Select
              value={buyProductId?.toString() || ""}
              onValueChange={(v) => setBuyProductId(+v)}
              disabled={!producerId}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue
                  placeholder={
                    producerId
                      ? "Selecciona un producto"
                      : "Elige productor primero"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                {producerProducts.length > 0 ? (
                  producerProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} (Stock: {p.stock})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no_products" disabled>
                    {producerId ? "No hay productos" : ""}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-gray-200">Cantidad</Label>
            <Input
              type="number"
              min={1}
              max={maxStock}
              value={buyQty}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) setBuyQty(val);
              }}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder={
                maxStock !== undefined ? `Máx: ${maxStock}` : "Ingrese cantidad"
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
            <Label className="text-gray-200">
              Precio Unitario (USD)
            </Label>
            <div className="bg-slate-700 border-slate-600 text-white px-3 py-2 rounded">
              {selectedProduct
                ? `$${Number(selectedProduct.price).toFixed(2)}`
                : "-"}
            </div>
          </div>

          <div>
            <Label className="text-gray-200">Notas</Label>
            <Input
              value={buyNotes}
              onChange={(e) => setBuyNotes(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Comprar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
