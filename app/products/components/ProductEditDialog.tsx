// app/products/components/ProductEditDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {Dialog,DialogTrigger,DialogContent,DialogHeader,DialogTitle,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem,} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { categories } from "./categories";
import { useAuthStore } from "@/stores/auth-store";
import {updateProductOnChain,generateMetadataHash,} from "@/lib/products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

interface ProductPayload {
  id: number;
  name: string;
  description: string;
  category: string;
  origin: string;
  production_date: string;
  is_active: boolean;
  metadata_hash?: string | null;
  stock: number;
}

interface Props {
  product: ProductPayload | null;
  userRole: string;
  onClose: () => void;
  onUpdate: (updated: Partial<ProductPayload> & { id: number }) => void;
}

export function ProductEditDialog({
  product,
  userRole,
  onClose,
  onUpdate,
}: Props) {
  if (!(userRole === "producer" || userRole === "admin")) return null;

  const { token } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProductPayload>({
    id: 0,
    name: "",
    description: "",
    category: "",
    origin: "",
    production_date: "",
    is_active: true,
    metadata_hash: null,
    stock: 0,
  });

  useEffect(() => {
    if (open && product) {
      setFormData(product);
    }
  }, [open, product]);

  const handleChange = (
    key: keyof ProductPayload,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!product || !token) return;

    try {
      let metadataHash = generateMetadataHash(formData);
      if (metadataHash.length > 64) {
        console.warn("Hash muy largo, truncando a 64 caracteres");
        metadataHash = metadataHash.slice(0, 64);
      }
      await updateProductOnChain(formData.id, formData.name, metadataHash);
      const { id, ...rest } = formData;
      const payload = {
        ...rest,
        metadata_hash: metadataHash,
        stock: (formData as any).stock
      };

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend Error:", text);
        throw new Error("Error al actualizar producto");
      }

      const result = await res.json();
      onUpdate({ id, ...payload });
      setOpen(false);
      onClose();
    } catch (err) {
      console.error("Error en handleSubmit:", err);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) onClose();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <Label className="text-white">Nombre</Label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-white">Descripción</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-white">Origen</Label>
          <Input
            value={formData.origin}
            onChange={(e) => handleChange("origin", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-white">Fecha de Producción</Label>
          <Input
            type="date"
            value={formData.production_date}
            onChange={(e) => handleChange("production_date", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-white">Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => handleChange("category", val)}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-white">Stock</Label>
          <Input
            type="number"
            min={0}
            value={formData.stock}
            onChange={(e) => handleChange("stock", Number(e.target.value))}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
