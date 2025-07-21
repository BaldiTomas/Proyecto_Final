const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middlewares/auth");

router.use(authenticateToken);

// 1) Compras pendientes
router.get("/purchases", async (req, res) => {
  const status = req.query.status || "pending";
  try {
    const { rows } = await pool.query(
      `SELECT
         st.id,
         st.product_id,
         p.name        AS product_name,
         st.quantity,
         st.total_amount,
         b.name        AS buyer_name,
         s.name        AS seller_name,
         st.status,
         st.created_at
       FROM sale_transactions st
       JOIN products p ON st.product_id = p.id
       JOIN users b ON st.buyer_id = b.id
       JOIN users s ON st.seller_id = s.id
       WHERE st.status = $1
       ORDER BY st.created_at DESC`,
      [status]
    );
    res.json({ purchases: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener compras pendientes" });
  }
});

// 2) Productos activos
router.get("/products", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.id, p.name, p.description, p.category,
         u.name AS producer_name
       FROM products p
       JOIN users u ON p.producer_id = u.id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC`
    );
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// 3) Listar envíos
router.get("/shipments", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         s.id, s.product_id, p.name AS product_name,
         s.origin, s.destination, s.transport_company,
         s.quantity, s.status, s.notes,
         s.blockchain_hash, s.created_at
       FROM shipments s
       JOIN products p ON s.product_id = p.id
       ORDER BY s.created_at DESC`
    );
    res.json({ shipments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener envíos" });
  }
});

// 4) Crear envío + confirmar compra
router.post("/shipments", async (req, res) => {
  try {
    const { user } = req;
    const {
      productId,
      origin,
      destination,
      transportCompany = "",
      quantity,
      notes = "",
      transactionId,
    } = req.body;
    if (!productId || !origin || !destination || !quantity) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    // Inserta con status=in_transit
    const { rows } = await pool.query(
      `INSERT INTO shipments
         (product_id, distributor_id, origin, destination, transport_company, quantity, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'in_transit')
       RETURNING *`,
      [productId, user.id, origin, destination, transportCompany, quantity, notes]
    );
    // Confirma la transacción
    if (transactionId) {
      await pool.query(
        `UPDATE sale_transactions
           SET status='confirmed', updated_at=CURRENT_TIMESTAMP
         WHERE id=$1`,
        [transactionId]
      );
    }
    res
      .status(201)
      .json({ message: "Envío creado en in_transit y compra confirmada", shipment: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno al crear envío" });
  }
});

// 5) Actualizar estado de envío
router.put("/shipments/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ["in_transit", "delivered", "cancelled"];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: "Estado no válido" });
  }
  try {
    await pool.query(
      `UPDATE shipments
         SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, id]
    );
    res.json({ message: `Envío ${id} actualizado a ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno al actualizar estado" });
  }
});

// GET /api/stats/distributor
router.get("/stats/distributor", async (req, res) => {
  try {
    // 1) Conteos
    const [
      inTransitRes,
      deliveredRes,
      pendingTransfersRes,
      custodyRes,
      recentShipmentsRes
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM shipments WHERE status = 'in_transit'"),
      pool.query("SELECT COUNT(*) FROM shipments WHERE status = 'delivered'"),
      pool.query("SELECT COUNT(*) FROM product_transfers WHERE status = 'pending'"),
      pool.query(
        "SELECT COUNT(*) AS products_count, COALESCE(SUM(stock),0) AS total_stock FROM product_custodies WHERE user_id = $1",
        [req.user.id]
      ),
      // 5) Últimos 5 envíos de este distribuidor
      pool.query(
        `SELECT
           s.id,
           p.name AS product_name,
           s.status,
           s.notes,
           s.created_at
         FROM shipments s
         JOIN products p ON s.product_id = p.id
         WHERE s.distributor_id = $1
         ORDER BY s.created_at DESC
         LIMIT 5`,
        [req.user.id]
      )
    ]);

    res.json({
      activeShipments: Number(inTransitRes.rows[0].count),
      completedShipments: Number(deliveredRes.rows[0].count),
      pendingTransfers: Number(pendingTransfersRes.rows[0].count),
      productsInCustody: Number(custodyRes.rows[0].products_count),
      totalCustodyStock: Number(custodyRes.rows[0].total_stock),
      recentShipments: recentShipmentsRes.rows,  // aquí van los 5 envíos
    });
  } catch (err) {
    console.error("Error al cargar stats/distributor:", err);
    res.status(500).json({ error: "Error interno al cargar estadísticas" });
  }
});


module.exports = router;
