const express = require("express")
const router = express.Router()
const pool = require("../db")
const { authenticateToken, authorizeRole } = require("../middlewares/auth")
const bcrypt = require("bcrypt")

router.post("/users", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const { name, email, password, role, wallet_address } = req.body
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: "Todos los campos son requeridos" })

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0)
      return res.status(409).json({ error: "Email ya registrado" })

    const password_hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, wallet_address) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, password_hash, role, wallet_address],
    )

    const userId = result.rows[0].id
    await pool.query(
      "INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, 'user_created', 'user', $2, $3)",
      [req.user.id, userId, JSON.stringify({ name, email, role })],
    )

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: { id: userId, name, email, role, wallet_address },
    })
  } catch (error) {
    console.error("Error creando usuario:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

router.get("/users", authenticateToken, authorizeRole(["admin", "seller"]), async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query

    const result = await pool.query(
      `SELECT id, name, email, role, wallet_address, is_active, created_at 
       FROM users WHERE is_active = TRUE 
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), Number(offset)]
    )

    const count = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = TRUE")

    res.json({
      users: result.rows,
      total: Number(count.rows[0].count),
      limit: Number(limit),
      offset: Number(offset),
    })
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

router.delete("/users/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const userId = Number(req.params.id)
    if (userId === req.user.id)
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" })

    const result = await pool.query(
      "UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = TRUE RETURNING name",
      [userId],
    )

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" })

    await pool.query(
      "INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, 'user_deleted', 'user', $2, $3)",
      [req.user.id, userId, JSON.stringify({ name: result.rows[0].name })],
    )

    res.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

router.put("/users/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  const userId = Number(req.params.id)
  const { name, email, role, wallet_address, password } = req.body

  console.log("🔧 Editando usuario:", userId)
  console.log("📦 Datos recibidos:", { name, email, role, wallet_address, password })

  if (!name || !email || !role) {
    return res.status(400).json({ error: "Faltan campos obligatorios" })
  }

  try {
    // Verificar si el usuario existe
    const existing = await pool.query("SELECT id FROM users WHERE id = $1 AND is_active = TRUE", [userId])
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    if (password) {
      const password_hash = await bcrypt.hash(password, 10)
      await pool.query(
        `UPDATE users SET name = $1, email = $2, role = $3, wallet_address = $4, password_hash = $5, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $6`,
        [name, email, role, wallet_address, password_hash, userId]
      )
    } else {
      await pool.query(
        `UPDATE users SET name = $1, email = $2, role = $3, wallet_address = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5`,
        [name, email, role, wallet_address, userId]
      )
    }

    await pool.query(
      "INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, 'user_updated', 'user', $2, $3)",
      [req.user.id, userId, JSON.stringify({ name, email, role })]
    )

    res.json({ message: "Usuario actualizado exitosamente" })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

module.exports = router