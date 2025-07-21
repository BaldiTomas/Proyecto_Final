const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const pool = require("../db")

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña son requeridos" })

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (!result.rows.length) return res.status(401).json({ error: "Credenciales inválidas" })

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, wallet_address: user.wallet_address },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    await pool.query(
      "INSERT INTO system_logs (user_id, action, ip_address, user_agent) VALUES ($1,$2,$3,$4)",
      [user.id, "login", req.ip, req.get("User-Agent")]
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, wallet_address: user.wallet_address } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

exports.verify = async (req, res) => {
  try {
    const { id } = req.user
    const result = await pool.query(
      "SELECT id, name, email, role, wallet_address FROM users WHERE id = $1 AND is_active = TRUE",
      [id]
    )
    if (!result.rows.length) return res.status(404).json({ error: "Usuario no encontrado" })
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}