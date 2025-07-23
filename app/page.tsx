// app/page.tsx  (antes HomePage)
"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Shield, Users, TrendingUp } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    }
  }, [user, router])

  const features = [
    {
      icon: Shield,
      title: "Seguridad Blockchain",
      description: "Trazabilidad inmutable y transparente de productos",
    },
    {
      icon: Users,
      title: "Gestión de Usuarios",
      description: "Control de acceso basado en roles para diferentes actores",
    },
    {
      icon: Package,
      title: "Rastreo de Productos",
      description: "Seguimiento completo desde el origen hasta el consumidor",
    },
    {
      icon: TrendingUp,
      title: "Análisis en Tiempo Real",
      description: "Métricas y reportes detallados de la cadena de suministro",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Track
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Chain
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Sistema avanzado de trazabilidad de productos impulsado por tecnología blockchain para garantizar
          transparencia y confianza en la cadena de suministro.
        </p>
        <Link href="/login" replace>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            Iniciar Sesión
          </Button>
        </Link>
      </div>
      <div className="container mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Características Principales
        </h2>
        <p className="text-gray-400 text-center mb-16">
          Nuestra plataforma ofrece herramientas completas para la gestión y trazabilidad de productos en toda la
          cadena de suministro.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card key={i} className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      <div className="container mx-auto px-4 py-24">
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-slate-700">
          <CardContent className="text-center py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Únete a la revolución de la trazabilidad blockchain y transforma tu cadena de suministro.
            </p>
            <Link href="/login" replace>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Comenzar Ahora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
