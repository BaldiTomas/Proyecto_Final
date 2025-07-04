import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Web3Provider } from "./contexts/Web3Context"
import { Toaster } from "react-hot-toast"
import Navbar from "./components/Navbar"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Products from "./pages/Products"
import ProductDetail from "./pages/ProductDetail"
import AdminPanel from "./pages/AdminPanel"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </Web3Provider>
    </AuthProvider>
  )
}

export default App
