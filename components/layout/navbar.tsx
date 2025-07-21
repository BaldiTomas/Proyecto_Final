// components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWeb3Store } from "@/stores/web3-store";
import { useWeb3 } from "@/providers/web3-provider";
import { Button } from "@/components/ui/button";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {User,LogOut,Settings,Wallet,Menu,X,Package,Shield,Truck,FileText,DollarSign,} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isConnected, account, chainId } = useWeb3Store();
  const { connectWallet, disconnectWallet } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "producer":
        return "Productor";
      case "seller":
        return "Vendedor";
      case "distributor":
        return "Distribuidor";
      case "user":
        return "Usuario";
      default:
        return role;
    }
  };

  const getNavigationItems = () => {
    const items = [
      { href: "/dashboard", label: "Dashboard", icon: Package },
    ];

    switch (user.role) {
      case "admin":
        return [
          ...items,
          { href: "/reports", label: "Reportes", icon: FileText },
          { href: "/products", label: "Productos", icon: Package },
          { href: "/admin", label: "Admin Panel", icon: Shield },
        ];
      case "distributor":
        return [
          ...items,
          { href: "/distributor", label: "Distribución", icon: Truck },
        ];
      case "seller":
        return [
          ...items,
          { href: "/reports", label: "Reportes", icon: FileText },
          { href: "/sales", label: "Ventas", icon: DollarSign },
          { href: "/products", label: "Productos", icon: Package },
        ];
      default:
        return [
          ...items,
          { href: "/reports", label: "Reportes", icon: FileText },
          { href: "/products", label: "Productos", icon: Package },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TrackChain</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="border-green-600 text-green-400 bg-green-900/20"
                >
                  <Wallet className="w-3 h-3 mr-1" />
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-white"
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={connectWallet}
                className="hidden sm:flex border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Conectar Wallet
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{user.name}</span>
                  <Badge
                    variant="secondary"
                    className="hidden sm:block bg-slate-700 text-gray-300"
                  >
                    {getRoleLabel(user.role)}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="text-gray-300 hover:text-white hover:bg-slate-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                {!isConnected && (
                  <DropdownMenuItem
                    onClick={connectWallet}
                    className="text-gray-300 hover:text-white hover:bg-slate-700 sm:hidden"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Conectar Wallet
                  </DropdownMenuItem>
                )}
                {isConnected && (
                  <DropdownMenuItem
                    onClick={disconnectWallet}
                    className="text-gray-300 hover:text-white hover:bg-slate-700 sm:hidden"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Desconectar Wallet
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white hover:bg-slate-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {isConnected && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between px-3 py-2">
                  <Badge
                    variant="outline"
                    className="border-green-600 text-green-400 bg-green-900/20"
                  >
                    <Wallet className="w-3 h-3 mr-1" />
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </Badge>
                  <span className="text-xs text-gray-400">Red: {chainId}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
