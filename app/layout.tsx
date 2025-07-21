import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "@/providers/auth-provider"
import { Web3Provider } from "@/providers/web3-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TrackChain - Sistema de Trazabilidad",
  description: "Sistema de trazabilidad de productos con blockchain",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <Web3Provider>
            <div className="min-h-screen bg-slate-900">{children}</div>
            <Toaster position="top-right" />
          </Web3Provider>
        </AuthProvider>
      </body>
    </html>
  )
}
