const bcryptUser = require("bcrypt")
const poolUser = require("../db")

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, wallet_address } = req.body
    if (![name, email, password, role].every(Boolean)) return res.status(400).json({ error: "Todos los campos son requeridos" })

    const exists = await poolUser.query("SELECT id FROM users WHERE email = $1", [email])
    if (exists.rows.length) return res.status(409).json({ error: "Email ya registrado" })

    const hash = await bcryptUser.hash(password, 10)
    const { rows } = await poolUser.query(
      `INSERT INTO users (name,email,password_hash,role,wallet_address) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [name, email, hash, role, wallet_address]
    )
    const userId = rows[0].id

    await poolUser.query(
      "INSERT INTO system_logs (user_id,action,entity_type,entity_id,details) VALUES ($1,'user_created','user',$2,$3)",
      [req.user.id, userId, JSON.stringify({ name, email, role })]
    )

    res.status(201).json({ message: "Usuario registrado exitosamente", user: { id: userId, name, email, role, wallet_address } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

exports.listUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const { rows } = await poolUser.query(
      `SELECT id,name,email,role,wallet_address,is_active,created_at FROM users WHERE is_active=TRUE ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), Number(offset)]
    )
    const countRes = await poolUser.query("SELECT COUNT(*) FROM users WHERE is_active=TRUE")
    res.json({ users: rows, total: Number(countRes.rows[0].count), limit: Number(limit), offset: Number(offset) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id === req.user.id) return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" })
    const { rows } = await poolUser.query(
      "UPDATE users SET is_active=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=$1 AND is_active=TRUE RETURNING name",
      [id]
    )
    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" })

    await poolUser.query(
      "INSERT INTO system_logs (user_id,action,entity_type,entity_id,details) VALUES ($1,'user_deleted','user',$2,$3)",
      [req.user.id, id, JSON.stringify({ name: rows[0].name })]
    )

    res.json({ message: "Usuario eliminado exitosamente" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}