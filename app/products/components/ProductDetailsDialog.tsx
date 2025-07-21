"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-green-900/20 text-green-400 border border-green-600",
  pending:  "bg-yellow-900/20 text-yellow-400 border border-yellow-600",
  rejected: "bg-red-900/20 text-red-400 border border-red-600",
  default:  "bg-gray-900/20 text-gray-400 border border-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  verified: "Verificado",
  pending:  "Pendiente",
  rejected: "Rechazado",
  default:  "Desconocido",
};

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

interface ProductDetailsDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDetailsDialog({ product, onClose }: ProductDetailsDialogProps) {
  if (!product) return null;

  const statusKey = product.status ?? "default";
  const txHash = product.blockchain_hash;

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 space-y-6">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Detail label="Productor" value={product.producer_name} />
          <Detail label="Descripción" value={product.description} />
          <Detail
            label="Estado"
            value={
              <Badge className={STATUS_STYLES[statusKey]}>
                {STATUS_LABELS[statusKey]}
              </Badge>
            }
          />
          <Detail label="Categoría" value={product.category} />
          <Detail label="Stock" value={product.stock.toString()} />
          <Detail label="Origen" value={product.origin} />
          <Detail label="Fecha de Producción" value={product.production_date.split("T")[0]} />
          <Detail label="Fecha de Creación" value={product.created_at?.split("T")[0] ?? "-"} />
          
          {/* Enlace a Etherscan Sepolia */}
          <div>
            <Label className="text-white">Ver en Etherscan</Label>
            {txHash ? (
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline text-sm"
              >
                {txHash.slice(0, 10)}…{/* recorta para no romper el layout */}
              </a>
            ) : (
              <p className="text-gray-300 text-sm">No registrado</p>
            )}
          </div>

          <Detail label="Activo" value={product.is_active ? "Sí" : "No"} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <Label className="text-white">{label}</Label>
      {typeof value === "string" ? (
        <p className="text-gray-300">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}
