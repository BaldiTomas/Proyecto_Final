// app/admin/components/ActivityPanel.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecentActivity {
  id: number;
  user_name: string | null;
  action: string;
  created_at: string;
  details: string;
}

interface AdminStats {
  users: number;
  products: number;
  transactions: number;
  shipments: number;
  transfers: number;
  recent_activity: Array<{
    id: number;
    user_name: string | null;
    action: string;
    created_at: string;
    details?: string | Record<string, any>;
  }>;
}

export default function ActivityPanel() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [page, setPage] = useState(0);

  const logsPerPage = 10;
  const totalPages = Math.ceil(activity.length / logsPerPage);

  useEffect(() => {
    if (!token) return;
    const API = process.env.NEXT_PUBLIC_API_BASE_URL;

    const statsPromise = fetch(`${API}/stats/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }
      return res.json() as Promise<AdminStats>;
    });

    const shipmentsPromise = fetch(`${API}/distributor/shipments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) return { shipments: [] };
        return res.json() as Promise<{ shipments: any[] }>;
      })
      .catch(() => ({ shipments: [] }));

    const salesPromise = fetch(`${API}/sale_transactions?status=all&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) return { transactions: [] };
        return res.json() as Promise<{ transactions: any[] }>;
      })
      .catch(() => ({ transactions: [] }));

    Promise.all([statsPromise, shipmentsPromise, salesPromise])
      .then(([adminData, shipData, salesData]) => {
        setStats(adminData);

        const adminActivity: RecentActivity[] = adminData.recent_activity.map(a => ({
          id: a.id,
          user_name: a.user_name,
          action: a.action,
          created_at: a.created_at,
          details:
            typeof a.details === "object"
              ? JSON.stringify(a.details)
              : a.details || "",
        }));

        const shipActivity: RecentActivity[] = shipData.shipments.map(s => ({
          id: s.id,
          user_name: s.distributor_name || null,
          action: "Envío realizado",
          created_at: s.created_at,
          details: `Producto: ${s.product_name}, Cantidad: ${s.quantity}`,
        }));

        const salesActivity: RecentActivity[] = salesData.transactions.map(t => ({
          id: t.id,
          user_name: t.seller_name || null,
          action: "Venta realizada",
          created_at: t.created_at,
          details: `Producto: ${t.product_name}, Cantidad: ${t.quantity}`,
        }));

        const all = [...adminActivity, ...shipActivity, ...salesActivity].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivity(all);
      })
      .catch(err => {
        console.error("Error cargando actividad:", err);
        toast.error("Error cargando actividad reciente");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="text-gray-400">Cargando estadísticas…</p>;
  }
  if (!stats) {
    return <p className="text-red-500">No se pudieron cargar las estadísticas.</p>;
  }

  const summary = [
    { label: "Usuarios", value: stats.users, color: "bg-blue-600" },
    { label: "Productos", value: stats.products, color: "bg-green-600" },
    { label: "Transacciones", value: stats.transactions, color: "bg-yellow-600" },
    { label: "Envíos", value: stats.shipments, color: "bg-purple-600" },
  ];

  const start = page * logsPerPage;
  const end = start + logsPerPage;
  const pageItems = activity.slice(start, end);

  return (
    <div className="space-y-6">
      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map(({ label, value, color }) => (
          <Card key={label} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`text-xl ${color}`}>{value}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actividad reciente */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-gray-400">No hay actividad reciente.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map(act => (
                    <TableRow key={`${act.id}-${act.created_at}`}>
                      <TableCell>
                        {new Date(act.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{act.user_name ?? "—"}</TableCell>
                      <TableCell>{act.action}</TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {act.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-gray-300">
                  Página {page + 1} de {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
