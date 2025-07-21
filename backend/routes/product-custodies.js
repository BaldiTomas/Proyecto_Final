const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middlewares/auth");

// GET /api/product_custodies?user_id=XX&limit=50&offset=0
router.get("/", authenticateToken, async (req, res) => {
  const { user_id, limit = 50, offset = 0 } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id es requerido" });

  try {
    // Trae todas las custodias del usuario, junto a info del producto
    const data = await pool.query(`
      SELECT
        pc.product_id,
        pc.stock,
        p.name AS product_name,
        p.category,
        p.origin,
        p.description,
        p.production_date,
        p.producer_id,
        u.name AS producer_name
      FROM product_custodies pc
      JOIN products p ON pc.product_id = p.id
      JOIN users u ON p.producer_id = u.id
      WHERE pc.user_id = $1 AND pc.stock > 0 AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [user_id, limit, offset]);

    res.json({ custodies: data.rows, total: data.rows.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
