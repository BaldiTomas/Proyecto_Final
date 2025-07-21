const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("../db")
const { authenticateToken } = require("../middlewares/auth")

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña son requeridos" })

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (result.rows.length === 0) return res.status(401).json({ error: "Credenciales inválidas" })

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) return res.status(401).json({ error: "Credenciales inválidas" })

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, wallet_address: user.wallet_address }, process.env.JWT_SECRET, { expiresIn: "24h" })

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

// Verificar token
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, wallet_address FROM users WHERE id = $1 AND is_active = TRUE", [req.user.id])
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" })
    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error("Error verificando token:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

module.exports = router