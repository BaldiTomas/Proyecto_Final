// routes/product-transfers.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");

router.put(
  "/:id/status",
  authenticateToken,
  authorizeRole(["distributor", "admin"]),
  async (req, res) => {
    const transferId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!["completed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Estado de transferencia inválido." });
    }

    try {
      await pool.query("BEGIN");
      const { rows } = await pool.query(
        `SELECT product_id, from_user_id, to_user_id, quantity, status AS current_status
           FROM public.product_transfers
           WHERE id = $1 FOR UPDATE`,
        [transferId]
      );
      if (rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ error: "Transferencia no encontrada." });
      }
      const { product_id, from_user_id, to_user_id, quantity, current_status } = rows[0];
      if (current_status !== "pending") {
        await pool.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: `La transferencia ya fue ${current_status}. No se puede modificar.` });
      }
      if (status === "completed") {
        const updFrom = await pool.query(
          `UPDATE public.products
           SET stock = stock - $1
           WHERE id = $2 AND current_custody_id = $3 AND stock >= $1 RETURNING stock`,
          [quantity, product_id, from_user_id]
        );
        if (updFrom.rows.length === 0) {
          await pool.query("ROLLBACK");
          return res
            .status(400)
            .json({ error: "Stock insuficiente o custodia inválida del remitente." });
        }
        const exists = await pool.query(
          `SELECT 1 FROM public.products
           WHERE id = $1 AND current_custody_id = $2`,
          [product_id, to_user_id]
        );
        if (exists.rows.length) {
          await pool.query(
            `UPDATE public.products
             SET stock = stock + $1
             WHERE id = $2 AND current_custody_id = $3`,
            [quantity, product_id, to_user_id]
          );
        } else {
          const orig = await pool.query(
            `SELECT name, description, price, sku, image_url
             FROM public.products WHERE id = $1`,
            [product_id]
          );
          if (orig.rows.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({ error: "Producto original no encontrado." });
          }
          const { name, description, price, sku, image_url } = orig.rows[0];
          await pool.query(
            `INSERT INTO public.products
             (name, description, price, stock, sku, image_url, current_custody_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [name, description, price, quantity, sku, image_url, to_user_id]
          );
        }
      }
      await pool.query(
        `UPDATE public.product_transfers
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [status, transferId]
      );

      await pool.query("COMMIT");
      return res.json({ message: `Transferencia ${status} con éxito.` });
    } catch (err) {
      await pool.query("ROLLBACK");
      console.error("Error al procesar la transferencia:", err);
      return res.status(500).json({ error: "Error interno al procesar la transferencia." });
    }
  }
);

module.exports = router;