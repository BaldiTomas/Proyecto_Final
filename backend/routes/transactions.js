// backend/routes/transactions.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");

/**
 * POST /
 * Crea una venta, actualiza custodia, registra en product_history (con hash opcional)
 * y en system_logs.
 */
router.post(
  "/",
  authenticateToken,
  authorizeRole(["seller", "producer", "admin"]),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        product_id,
        buyer_email,
        quantity,
        price_per_unit,
        location,
        notes,
        blockchain_hash,
      } = req.body;

      // Validamos solo los campos imprescindibles
      if (
        !product_id ||
        !buyer_email ||
        !quantity ||
        !price_per_unit
      ) {
        return res
          .status(400)
          .json({ error: "Todos los campos son requeridos" });
      }

      await client.query("BEGIN");

      // Buscar ID de comprador
      const buyerRes = await client.query(
        "SELECT id FROM users WHERE email = $1 AND is_active = TRUE",
        [buyer_email]
      );
      if (!buyerRes.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Comprador no encontrado" });
      }
      const buyer_id = buyerRes.rows[0].id;

      // Determinar vendedor
      const seller_id = req.body.seller_id || req.user.id;

      // Chequear y reservar stock
      const pcRes = await client.query(
        "SELECT stock FROM product_custodies WHERE product_id = $1 AND user_id = $2 FOR UPDATE",
        [product_id, seller_id]
      );
      if (!pcRes.rows.length) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ error: "No posees este producto en custodia" });
      }
      const currentStock = parseInt(pcRes.rows[0].stock, 10);
      if (currentStock < parseInt(quantity, 10)) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: `Stock insuficiente: tienes ${currentStock}` });
      }
      await client.query(
        "UPDATE product_custodies SET stock = stock - $1 WHERE product_id = $2 AND user_id = $3",
        [quantity, product_id, seller_id]
      );
      await client.query(
        `INSERT INTO product_custodies (product_id, user_id, stock)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, user_id)
           DO UPDATE SET stock = product_custodies.stock + EXCLUDED.stock`,
        [product_id, buyer_id, quantity]
      );

      // Insertar transacción en base de datos
      const total_amount = Number(quantity) * Number(price_per_unit);
      const { rows: insertRows } = await client.query(
        `INSERT INTO sale_transactions 
           (product_id, seller_id, buyer_id, quantity, price_per_unit, total_amount, location, notes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP)
         RETURNING id`,
        [
          product_id,
          seller_id,
          buyer_id,
          quantity,
          price_per_unit,
          total_amount,
          location,
          notes,
        ]
      );
      const transactionId = insertRows[0].id;

      // Registrar en product_history, guardando blockchain_hash si viene
      await client.query(
        `INSERT INTO product_history
           (product_id, actor_id, action, location, notes, blockchain_hash)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          product_id,
          seller_id,
          "Venta de producto",
          location,
          notes || null,
          blockchain_hash || null,
        ]
      );

      // Registrar en system_logs
      await client.query(
        `INSERT INTO system_logs
           (user_id, action, entity_type, entity_id, details)
         VALUES ($1,'transaction_created','sale_transaction',$2,$3)`,
        [
          seller_id,
          transactionId,
          JSON.stringify({ product_id, total_amount }),
        ]
      );

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
          location,
          notes,
          blockchain_hash: blockchain_hash || null,
          status: "pending",
        },
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

/**
 * GET /
 * Lista transacciones del usuario (como vendedor o comprador), con filtro opcional por estado.
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const params = [req.user.id];
    const whereClauses = ["(st.seller_id = $1 OR st.buyer_id = $1)"];

    if (status) {
      params.push(status);
      whereClauses.push(`st.status = $${params.length}`);
    }

    params.push(Number(limit), Number(offset));
    const limitParam = `$${params.length - 1}`;
    const offsetParam = `$${params.length}`;

    const query = `
      SELECT
        st.*,
        p.name AS product_name,
        s.name AS seller_name,
        b.name AS buyer_name
      FROM sale_transactions st
      JOIN products p ON st.product_id = p.id
      JOIN users s ON st.seller_id = s.id
      JOIN users b ON st.buyer_id = b.id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY st.created_at DESC
      LIMIT ${limitParam}
      OFFSET ${offsetParam}
    `;

    const { rows } = await pool.query(query, params);
    res.json({ transactions: rows, total: rows.length });
  } catch (err) {
    console.error("Error obteniendo transacciones:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
