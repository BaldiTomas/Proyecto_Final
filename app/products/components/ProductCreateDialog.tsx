"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem,} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { categories } from "./categories";
import { registerProductOnChain, generateMetadataHash,} from "@/lib/contracts";
import { useAuthStore } from "@/stores/auth-store";

interface NewProduct {
  name: string;
  description: string;
  category: string;
  origin: string;
  production_date: string;
  stock: number;
  price: number;
}

interface Props {
  userRole: string;
  onCreate: (
    p: NewProduct & { blockchain_hash: string; metadata_hash: string }
  ) => Promise<void>;
}

export function ProductCreateDialog({ userRole, onCreate }: Props) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    category: "",
    origin: "",
    production_date: new Date().toISOString().slice(0, 10),
    stock: 0,
    price: 0,
  });

  if (!(userRole === "producer" || userRole === "admin")) return null;

  const fields: {
    key: keyof NewProduct;
    type: "input" | "textarea";
    label: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  }[] = [
    { key: "name", type: "input", label: "Nombre" },
    { key: "description", type: "textarea", label: "Descripción" },
    { key: "origin", type: "input", label: "Origen" },
    { key: "production_date",
      type: "input",
      label: "Fecha de producción",
      inputProps: { type: "date" }, },
    { key: "stock",
      type: "input",
      label: "Stock",
      inputProps: { type: "number", min: 0 }, },
    { key: "price",
      type: "input",
      label: "Precio Unitario (USD)",
      inputProps: { type: "number", min: 0, step: "0.01" }, },
  ];

  const handleCreate = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión");
      return;
    }
    if (!newProduct.name.trim()) {
      toast.error("Ingresa un nombre");
      return;
    }
    if (!newProduct.category) {
      toast.error("Selecciona una categoría");
      return;
    }
    if (isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
      toast.error("Ingresa un precio válido");
      return;
    }

    try {
      const metadata_hash = generateMetadataHash(newProduct);
      const productId = await registerProductOnChain(
        newProduct.name,
        metadata_hash,
        user.id
      );

      await onCreate({
        ...newProduct,
        metadata_hash,
        blockchain_hash: productId.toString(),
      });

      toast.success("Producto creado exitosamente");
      setOpen(false);
      setNewProduct({
        name: "",
        description: "",
        category: "",
        origin: "",
        production_date: new Date().toISOString().slice(0, 10),
        stock: 0,
        price: 0,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al crear producto");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            Crear Nuevo Producto
          </DialogTitle>
        </DialogHeader>

        {fields.map(({ key, type, label, inputProps }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key} className="text-white capitalize">
              {label}
            </Label>
            {type === "textarea" ? (
              <Textarea
                id={key}
                value={String(newProduct[key])}
                onChange={(e) =>
                  setNewProduct((p) => ({
                    ...p,
                    [key]: e.target.value as any,
                  }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder={`Ingresa la ${label.toLowerCase()}`}
              />
            ) : (
              <Input
                id={key}
                {...(inputProps ?? {})}
                value={newProduct[key] as any}
                onChange={(e) =>
                  setNewProduct((p) => ({
                    ...p,
                    [key]:
                      inputProps?.type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  }))
                }
                className="bg-slate-700 border-slate-600 text-white"
                placeholder={`Ingresa la ${label.toLowerCase()}`}
              />
            )}
          </div>
        ))}

        <div className="space-y-1">
          <Label htmlFor="category" className="text-white capitalize">
            Categoría
          </Label>
          <Select
            value={newProduct.category}
            onValueChange={(v) =>
              setNewProduct((p) => ({ ...p, category: v }))
            }
          >
            <SelectTrigger
              id="category"
              className="bg-slate-700 border-slate-600 text-white"
            >
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

        <div className="flex space-x-2 pt-4">
          <Button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Crear Producto
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-slate-600 text-gray-300"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
