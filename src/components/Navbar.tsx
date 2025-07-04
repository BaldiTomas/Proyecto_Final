"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useWeb3 } from "../contexts/Web3Context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Wallet } from "lucide-react"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              TraceChain
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/products"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Products
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Web3 Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-600">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet} className="text-xs bg-transparent">
                  <Wallet className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={connectWallet} className="text-xs bg-transparent">
                <Wallet className="w-4 h-4 mr-1" />
                Connect Wallet
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
