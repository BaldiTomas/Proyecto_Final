"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useWeb3 } from "../contexts/Web3Context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Users, TrendingUp, Activity, Wallet } from "lucide-react"

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { isConnected, connectWallet, account } = useWeb3()
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalTransactions: 0,
    recentActivity: [],
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // This would fetch actual dashboard statistics
      // For now, we'll use mock data
      setStats({
        totalProducts: 156,
        activeProducts: 142,
        totalTransactions: 89,
        recentActivity: [
          { id: 1, action: "Product Created", product: "Organic Coffee Beans", time: "2 hours ago" },
          { id: 2, action: "Sale Completed", product: "Premium Tea Leaves", time: "4 hours ago" },
          { id: 3, action: "Product Transferred", product: "Artisan Honey", time: "6 hours ago" },
        ],
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const getRoleSpecificContent = () => {
    switch (user?.role) {
      case "admin":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">+23% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProducts}</div>
                <p className="text-xs text-muted-foreground">91% of total products</p>
              </CardContent>
            </Card>
          </div>
        )
      case "producer":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">My Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">Products registered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Verified Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">21</div>
                <p className="text-xs text-muted-foreground">91% verification rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Products Tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Products in your history</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">
            Role: <Badge variant="secondary">{user?.role}</Badge>
          </p>
        </div>

        {!isConnected && (
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Connect your wallet</p>
                <p className="text-xs text-gray-500">Enable blockchain features</p>
              </div>
              <Button size="sm" onClick={connectWallet}>
                Connect
              </Button>
            </div>
          </Card>
        )}
      </div>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-green-500" />
              <span>Wallet Connected</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Address: <code className="bg-gray-100 px-2 py-1 rounded">{account}</code>
            </p>
          </CardContent>
        </Card>
      )}

      {getRoleSpecificContent()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.product}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.role === "producer" && (
                <>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Register New Product
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Activity className="mr-2 h-4 w-4" />
                    Update Product Status
                  </Button>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Reports
                  </Button>
                </>
              )}
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                View All Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
