const pool = require('../db');

// Stats generales (admin)
exports.getAdminStats = async (req, res) => {
  try {
    const [u, p, t, s, tr] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM products WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) FROM sale_transactions'),
      pool.query('SELECT COUNT(*) FROM shipments'),
      pool.query('SELECT COUNT(*) FROM product_transfers'),
    ]);
    const recent = await pool.query(`
      SELECT sl.*, u.name AS user_name
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ORDER BY sl.created_at DESC
      LIMIT 10
    `);

    res.json({
      users: Number(u.rows[0].count),
      products: Number(p.rows[0].count),
      transactions: Number(t.rows[0].count),
      shipments: Number(s.rows[0].count),
      transfers: Number(tr.rows[0].count),
      recent_activity: recent.rows,
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getDistributorStats = async (req, res) => {
  try {
    const [inTransit, delivered, pending, custody] = await Promise.all([
      pool.query(
        "SELECT COUNT(*) FROM shipments WHERE distributor_id = $1 AND status = 'in_transit'",
        [req.user.id]
      ),
      pool.query(
        "SELECT COUNT(*) FROM shipments WHERE distributor_id = $1 AND status = 'delivered'",
        [req.user.id]
      ),
      pool.query(
        "SELECT COUNT(*) FROM product_transfers WHERE from_user_id = $1 AND status = 'pending'",
        [req.user.id]
      ),
      pool.query(
        "SELECT COUNT(*) FROM products WHERE current_custody_id = $1 AND is_active = TRUE",
        [req.user.id]
      ),
    ]);

    res.json({
      active_shipments: Number(inTransit.rows[0].count),
      completed_shipments: Number(delivered.rows[0].count),
      pending_transfers: Number(pending.rows[0].count),
      products_in_custody: Number(custody.rows[0].count),
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas del distribuidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
