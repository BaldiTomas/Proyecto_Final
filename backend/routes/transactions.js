const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");

// Crear transacción de venta (mueve stock/custodia en product_custodies)
router.post(
  "/",
  authenticateToken,
  authorizeRole(["seller", "producer", "admin"]),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { product_id, buyer_email, quantity, price_per_unit, location, notes } = req.body;
      if (![product_id, buyer_email, quantity, price_per_unit].every(Boolean)) {
        return res.status(400).json({ error: "Todos los campos son requeridos" });
      }

      await client.query("BEGIN");

      // 1. Buscar comprador
      const buyerRes = await client.query(
        "SELECT id FROM users WHERE email = $1 AND is_active = TRUE",
        [buyer_email]
      );
      if (!buyerRes.rows.length)
        return res.status(404).json({ error: "Comprador no encontrado" });
      const buyer_id = buyerRes.rows[0].id;
      const seller_id = req.body.seller_id || req.user.id;
      const total_amount = quantity * price_per_unit;

      // 2. Verificar stock del vendedor en product_custodies
      const pcRes = await client.query(
        "SELECT stock FROM product_custodies WHERE product_id = $1 AND user_id = $2 FOR UPDATE",
        [product_id, seller_id]
      );
      if (!pcRes.rows.length)
        return res.status(404).json({ error: "No posees este producto en custodia" });

      const currentStock = parseInt(pcRes.rows[0].stock, 10);
      if (currentStock < parseInt(quantity, 10))
        return res.status(400).json({ error: `Stock insuficiente: tienes ${currentStock}` });

      // 3. Descontar stock al vendedor
      await client.query(
        "UPDATE product_custodies SET stock = stock - $1 WHERE product_id = $2 AND user_id = $3",
        [quantity, product_id, seller_id]
      );

      // 4. Sumar stock al comprador (o crear custodia si no existe)
      await client.query(
        `INSERT INTO product_custodies (product_id, user_id, stock)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, user_id)
         DO UPDATE SET stock = product_custodies.stock + EXCLUDED.stock`,
        [product_id, buyer_id, quantity]
      );

      // 5. Registrar la transacción de venta
      const { rows: insert } = await client.query(
        `INSERT INTO sale_transactions 
          (product_id, seller_id, buyer_id, quantity, price_per_unit, total_amount, location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [product_id, seller_id, buyer_id, quantity, price_per_unit, total_amount, location, notes]
      );
      const transactionId = insert[0].id;

      // 6. Registrar logs e historial
      await Promise.all([
        client.query(
          "INSERT INTO product_history (product_id, actor_id, action, location, notes) VALUES ($1,$2,'sale_created',$3,$4)",
          [product_id, seller_id, location, `Cantidad: ${quantity}`]
        ),
        client.query(
          "INSERT INTO system_logs (user_id, action, entity_type, entity_id, details) VALUES ($1,'transaction_created','transaction',$2,$3)",
          [seller_id, transactionId, JSON.stringify({ product_id, total_amount })]
        )
      ]);

      await client.query("COMMIT");

      res.status(201).json({
        message: "Transacción creada exitosamente",
        transaction: {
          id: transactionId,
          product_id,
          seller_id,
          buyer_id,
          quantity,
          price_per_unit,
          total_amount,
          status: "pending"
        }
      });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Error creando transacción:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    } finally {
      client.release();
    }
  }
);

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const params = [req.user.id];
    let where = ["(st.seller_id = $1 OR st.buyer_id = $1)"];
    if (status) {
      params.push(status);
      where.push(`st.status = $${params.length}`);
    }
    params.push(Number(limit), Number(offset));

    const query = `
      SELECT st.*, p.name AS product_name,
             s.name AS seller_name, b.name AS buyer_name
      FROM sale_transactions st
      JOIN products p ON st.product_id = p.id
      JOIN users s ON st.seller_id = s.id
      JOIN users b ON st.buyer_id = b.id
      WHERE ${where.join(" AND ")}
      ORDER BY st.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const { rows } = await pool.query(query, params);
    res.json({ transactions: rows, total: rows.length });
  } catch (err) {
    console.error("Error obteniendo transacciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
