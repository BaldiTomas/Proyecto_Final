// app/admin/page.tsx
"use client";

import { Shield } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Navbar } from "@/components/layout/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import UserManager from "./components/UserManager";
import ActivityPanel from "./components/ActivityPanel";

export default function AdminPage() {
  const { user } = useAuthStore();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h2>
            <p className="text-gray-400">No tienes permisos para acceder a esta página.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
            <p className="text-gray-400 mt-1">Gestiona usuarios y productos</p>
          </div>
          <Badge variant="secondary" className="w-fit bg-slate-700 text-gray-300">
            <Shield className="w-4 h-4 mr-2" /> Administrador
          </Badge>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="products">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>
          <TabsContent value="products">
            <ActivityPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
