const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { ethers } = require("ethers")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001

// Configuración de base de datos PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "trackchain_db",
  port: process.env.DB_PORT || 5432,
})

// Configuración blockchain
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545")
const privateKey = process.env.PRIVATE_KEY
const wallet = privateKey ? new ethers.Wallet(privateKey, provider) : null

const CONTRACT_ADDRESSES = {
  USER_REGISTRATION: process.env.CONTRACT_USER_REGISTRATION,
  PRODUCT_REGISTRATION: process.env.CONTRACT_PRODUCT_REGISTRATION,
  SALE_TRANSACTION: process.env.CONTRACT_SALE_TRANSACTION,
  SHIPMENT_REGISTRATION: process.env.CONTRACT_SHIPMENT_REGISTRATION,
  PRODUCT_TRANSFER: process.env.CONTRACT_PRODUCT_TRANSFER,
}

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }))
app.use(express.json({ limit: "10mb" }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Demasiadas solicitudes, intenta más tarde" },
})
app.use(limiter)

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]
  if (!token) return res.status(401).json({ error: "Token de acceso requerido" })

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" })
    req.user = user
    next()
  })
}

const authorizeRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Permisos insuficientes" })
  next()
}

// Ruta de login (ejemplo adaptado)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña son requeridos" })

    const result = await pool.query("SELECT * FROM users WHERE email = $1 AND is_active = TRUE", [email])
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, wallet_address: user.wallet_address },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    )

    await pool.query(
      "INSERT INTO system_logs (user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
      [user.id, "login", req.ip, req.get("User-Agent")]
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, wallet_address: user.wallet_address },
    })
  } catch (error) {
    console.error("Error de login:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Ruta de salud
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), version: "1.0.0" })
})

app.use((error, req, res, next) => {
  console.error("Error no manejado:", error)
  res.status(500).json({ error: "Error interno del servidor" })
})

app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" })
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`)
})

module.exports = app
