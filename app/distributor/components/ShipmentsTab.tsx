"use client";

import { FC } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Package as PackageIcon } from "lucide-react";
import type { Product, Shipment, ShipmentStatus, NewShipmentData } from "../../types";

interface ShipmentsTabProps {
  products: Product[];
  shipments: Shipment[];
  isConnected: boolean;
  onRegister: (newShipmentData: NewShipmentData) => void;
  onUpdateStatus: (shipmentId: number, status: ShipmentStatus) => void;
}

function getStatusIcon(status: ShipmentStatus) {
  switch (status) {
    case "in_transit":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "delivered":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "cancelled":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <PackageIcon className="w-4 h-4 text-gray-500" />;
  }
}
function getStatusColor(status: ShipmentStatus) {
  switch (status) {
    case "in_transit":
      return "bg-yellow-900/20 text-yellow-400 border-yellow-600";
    case "delivered":
      return "bg-green-900/20 text-green-400 border-green-600";
    case "cancelled":
      return "bg-red-900/20 text-red-400 border-red-600";
    default:
      return "bg-gray-900/20 text-gray-400 border-gray-600";
  }
}

const ShipmentsTab: FC<ShipmentsTabProps> = ({
  products,
  shipments,
  isConnected,
  onRegister,
  onUpdateStatus,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-white">Gestión de Envíos</h2>
    </div>
    <div className="grid gap-4">
      {shipments.map((s) => (
        <Card key={s.id} className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg text-white">{s.product_name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {s.origin} → {s.destination}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(s.status)}>
                {getStatusIcon(s.status)}{" "}
                <span className="ml-1 capitalize">{s.status.replace("_", " ")}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Cantidad:</span>
                <p className="text-white font-medium">{s.quantity}</p>
              </div>
              <div>
                <span className="text-gray-400">Transportista:</span>
                <p className="text-white font-medium">{s.transport_company}</p>
              </div>
              <div>
                <span className="text-gray-400">Fecha:</span>
                <p className="text-white font-medium">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              {s.status === "in_transit" && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(s.id, "delivered")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirmar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(s.id, "cancelled")}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
            {s.notes && (
              <div className="mt-4 bg-slate-700/50 p-3 rounded-lg">
                <p className="text-sm text-gray-300">{s.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ShipmentsTab;
