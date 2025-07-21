// components/dashboard/stats-cards.tsx (EJEMPLO)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, Truck, HandCoins, Boxes, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  userRole: string;
  stats: any;
  loading: boolean;
}

export function StatsCards({ userRole, stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded animate-pulse w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-slate-700 rounded animate-pulse w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getCardsForRole = () => {
    switch (userRole) {
      case "admin":
        return [
          { title: "Usuarios Totales", value: stats.totalUsers, icon: <Users className="h-4 w-4 text-gray-500" /> },
          { title: "Productos", value: stats.activeProducts, icon: <Package className="h-4 w-4 text-gray-500" /> },
          { title: "Ventas Totales", value: stats.totalSales, icon: <ShoppingCart className="h-4 w-4 text-gray-500" /> },
          { title: "Envíos Pendientes", value: stats.pendingShipments, icon: <Truck className="h-4 w-4 text-gray-500" /> },
        ];
      case "producer":
        return [
          { title: "Mis Productos Producidos", value: stats.myProductsProduced, icon: <Boxes className="h-4 w-4 text-gray-500" /> },
        ];
      case "seller":
        return [
          { title: "Ingresos Totales", value: `$${Number(stats.totalRevenue || 0).toFixed(2)}`, icon: <HandCoins className="h-4 w-4 text-gray-500" /> }, // Formato de moneda
          { title: "Artículos Vendidos", value: stats.totalItemsSold, icon: <Package className="h-4 w-4 text-gray-500" /> },
          { title: "Productos en Stock", value: stats.productsInCustody, icon: <Boxes className="h-4 w-4 text-gray-500" /> },
        ];
      case "distributor":
        return [
          { title: "Envíos Activos", value: stats.activeShipments, icon: <Truck className="h-4 w-4 text-gray-500" /> },
          { title: "Envíos Completados", value: stats.completedShipments, icon: <CheckCircle className="h-4 w-4 text-gray-500" /> },
        ];
      case "user":
        return [
          { title: "Productos Vistos", value: stats.totalProductsViewed, icon: <Package className="h-4 w-4 text-gray-500" /> },
          { title: "Órdenes Recientes", value: stats.recentOrders, icon: <ShoppingCart className="h-4 w-4 text-gray-500" /> },
        ];
      default:
        return [];
    }
  };

  const cards = getCardsForRole();

  if (cards.length === 0) {
    return <div className="text-center py-8 text-gray-400">No hay estadísticas disponibles para este rol.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={card.title || index} className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}