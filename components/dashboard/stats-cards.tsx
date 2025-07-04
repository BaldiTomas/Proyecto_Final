"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Package, Users, Activity } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease"
  }
  icon: React.ReactNode
  description?: string
  progress?: number
}

function StatCard({ title, value, change, icon, description, progress }: StatCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div className="p-2 bg-blue-600/20 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1 text-white">{value}</div>

        {change && (
          <div className="flex items-center space-x-1">
            {change.type === "increase" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <Badge
              variant={change.type === "increase" ? "default" : "destructive"}
              className={`text-xs ${
                change.type === "increase"
                  ? "bg-green-900/20 text-green-400 border-green-600"
                  : "bg-red-900/20 text-red-400 border-red-600"
              }`}
            >
              {change.value > 0 ? "+" : ""}
              {change.value}%
            </Badge>
          </div>
        )}

        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}

        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-400 mt-1">{progress}% del objetivo</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  userRole: string
}

export function StatsCards({ userRole }: StatsCardsProps) {
  const getStatsForRole = () => {
    switch (userRole) {
      case "admin":
        return [
          {
            title: "Total de Usuarios",
            value: "245",
            change: { value: 12, type: "increase" as const },
            icon: <Users className="h-4 w-4 text-blue-400" />,
            description: "Usuarios activos",
          },
          {
            title: "Total de Productos",
            value: "1,234",
            change: { value: 8, type: "increase" as const },
            icon: <Package className="h-4 w-4 text-blue-400" />,
            description: "Productos registrados",
          },
          {
            title: "Transacciones",
            value: "89",
            change: { value: 23, type: "increase" as const },
            icon: <Activity className="h-4 w-4 text-blue-400" />,
            description: "Este mes",
          },
        ]
      case "producer":
        return [
          {
            title: "Mis Productos",
            value: "23",
            icon: <Package className="h-4 w-4 text-blue-400" />,
            description: "Productos registrados",
            progress: 76,
          },
          {
            title: "Productos Verificados",
            value: "21",
            icon: <Activity className="h-4 w-4 text-blue-400" />,
            description: "91% tasa de verificación",
            progress: 91,
          },
          {
            title: "Ventas Recientes",
            value: "7",
            change: { value: 40, type: "increase" as const },
            icon: <TrendingUp className="h-4 w-4 text-blue-400" />,
            description: "Este mes",
          },
        ]
      default:
        return [
          {
            title: "Productos Rastreados",
            value: "12",
            icon: <Package className="h-4 w-4 text-blue-400" />,
            description: "En tu historial",
          },
          {
            title: "Consultas Recientes",
            value: "5",
            icon: <Activity className="h-4 w-4 text-blue-400" />,
            description: "Esta semana",
          },
        ]
    }
  }

  const stats = getStatsForRole()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
