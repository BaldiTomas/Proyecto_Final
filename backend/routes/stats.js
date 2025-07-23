const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");

router.get(
  "/admin",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const [u, p, t, s, tr] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM users WHERE is_active = TRUE"),
        pool.query("SELECT COUNT(*) FROM products WHERE is_active = TRUE"),
        pool.query("SELECT COUNT(*) FROM sale_transactions"),
        pool.query("SELECT COUNT(*) FROM shipments"),
        pool.query("SELECT COUNT(*) FROM product_transfers"),
      ]);
      const recent = await pool.query(
        `
        SELECT sl.*, u.name AS user_name
        FROM system_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
        ORDER BY sl.created_at DESC
        LIMIT 10
      `
      );

      res.json({
        users: Number(u.rows[0].count),
        products: Number(p.rows[0].count),
        transactions: Number(t.rows[0].count),
        shipments: Number(s.rows[0].count),
        transfers: Number(tr.rows[0].count),
        recent_activity: recent.rows,
      });
    } catch (err) {
      console.error("Error obteniendo estadísticas:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

router.get(
  "/distributor",
  authenticateToken,
  authorizeRole(["distributor"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const [act, comp, pend, custody] = await Promise.all([
        pool.query(
          "SELECT COUNT(*) FROM shipments WHERE distributor_id = $1 AND status = 'in_transit'",
          [userId]
        ),
        pool.query(
          "SELECT COUNT(*) FROM shipments WHERE distributor_id = $1 AND status = 'delivered'",
          [userId]
        ),
        pool.query(
          "SELECT COUNT(*) FROM product_transfers WHERE from_user_id = $1 AND status = 'pending'",
          [userId]
        ),
        pool.query(
          "SELECT COUNT(*) FROM products WHERE current_custody_id = $1 AND is_active = TRUE",
          [userId]
        ),
      ]);

      res.json({
        active_shipments: Number(act.rows[0].count),
        completed_shipments: Number(comp.rows[0].count),
        pending_transfers: Number(pend.rows[0].count),
        products_in_custody: Number(custody.rows[0].count),
      });
    } catch (err) {
      console.error("Error obteniendo estadísticas del distribuidor:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

router.get('/seller-stats', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.user.id;
    const salesStatsQuery = `
      SELECT
        COUNT(id) AS total_sales_transactions,
        COALESCE(SUM(quantity * price_per_unit), 0) AS total_revenue,
        COALESCE(SUM(quantity), 0) AS total_items_sold
      FROM sale_transactions
      WHERE seller_id = $1;
    `;
    const salesStatsResult = await pool.query(salesStatsQuery, [sellerId]);
    const sellerSalesStats = salesStatsResult.rows[0];

    const productCustodyQuery = `
      SELECT 
        p.id,
        p.name,
        pc.stock
      FROM product_custodies pc
      JOIN products p ON p.id = pc.product_id
      WHERE pc.user_id = $1 AND pc.stock > 0 AND p.is_active = TRUE
      ORDER BY p.name;
    `;
    const productCustodyResult = await pool.query(productCustodyQuery, [sellerId]);
    const productsInCustody = productCustodyResult.rows;
    const productHistoryQuery = `
      SELECT
        ph.id,
        ph.action,
        ph.timestamp,
        ph.notes,
        p.name as product_name,
        u.name as actor_name
      FROM product_history ph
      JOIN products p ON ph.product_id = p.id
      JOIN users u ON ph.actor_id = u.id
      WHERE ph.actor_id = $1
      ORDER BY ph.timestamp DESC
      LIMIT 10;
    `;
    const productHistoryResult = await pool.query(productHistoryQuery, [sellerId]);
    const productHistory = productHistoryResult.rows;

    res.json({
      sellerSalesStats,
      productsInCustody,
      productHistory
    });

  } catch (error) {
    console.error("Error obteniendo estadísticas del vendedor:", error);
    res.status(500).json({ error: "Error al obtener estadísticas del vendedor" });
  }
});

module.exports = router;