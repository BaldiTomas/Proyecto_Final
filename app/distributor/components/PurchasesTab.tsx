"use client";
import React, { useState } from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter,DialogHeader, DialogTitle, DialogDescription, DialogTrigger} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Transaction, NewShipmentData } from "../../types";

interface PurchasesTabProps {
  purchases: Transaction[];
  onConfirmShipment: (data: NewShipmentData) => void;
}

export default function PurchasesTab({
  purchases,
  onConfirmShipment,
}: PurchasesTabProps) {
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [note, setNote] = useState<string>("");

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
      <h2 className="text-xl font-semibold text-white mb-4">Compras Pendientes</h2>
      <Table className="bg-slate-900 border border-slate-700 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Cant.</TableHead>
            <TableHead>Comprador</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.length > 0 ? (
            purchases.map((tx) => (
              <TableRow key={tx.id} className="text-white">
                <TableCell>{tx.id}</TableCell>
                <TableCell>{tx.product_name}</TableCell>
                <TableCell>{tx.quantity}</TableCell>
                <TableCell>{tx.buyer_name}</TableCell>
                <TableCell>{tx.total_amount}</TableCell>
                <TableCell>
                  <Dialog
                    open={activeTx?.id === tx.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setActiveTx(null);
                        setNote("");
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setActiveTx(tx);
                          setNote("");
                        }}
                      >
                        Crear Envío
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] overflow-auto">
                      <DialogHeader>
                        <DialogTitle>Confirmar Envío</DialogTitle>
                        <DialogDescription>
                          ¿Crear envío para la compra #{tx.id}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-2 text-sm">
                        <p><strong>Producto:</strong> {tx.product_name}</p>
                        <p><strong>Cantidad:</strong> {tx.quantity}</p>
                        <p><strong>Comprador:</strong> {tx.buyer_name}</p>
                      </div>
                      <div className="py-2">
                        <Label htmlFor="shipment-note" className="text-sm text-gray-300">
                          Nota (opcional)
                        </Label>
                        <Textarea
                          id="shipment-note"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full bg-slate-700 text-white border-slate-600"
                          placeholder="Comentario..."
                        />
                      </div>
                      <DialogFooter className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTx(null);
                            setNote("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            if (!activeTx) return;
                            onConfirmShipment({
                              productId: activeTx.product_id,
                              origin: "Venta",
                              destination: activeTx.buyer_name,
                              transportCompany: "",
                              quantity: activeTx.quantity,
                              notes: note,
                              transactionId: activeTx.id,
                            });
                            setActiveTx(null);
                            setNote("");
                          }}
                        >
                          Confirmar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400">
                No hay compras pendientes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
