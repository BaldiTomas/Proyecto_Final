// backend/routes/products.js

const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRole } = require("../middlewares/auth");

/**
 * POST /products
 * Crea un producto, su custodia inicial y registra en product_history la creación.
 */
router.post(
  "/",
  authenticateToken,
  authorizeRole(["producer", "admin"]),
  async (req, res) => {
    const {
      name,
      description,
      category,
      origin,
      production_date,
      stock,
      blockchain_hash,
      metadata_hash,
      price,
    } = req.body;
    const producer_id = req.user.id;

    if (
      !name ||
      !description ||
      !category ||
      !origin ||
      !production_date ||
      stock == null ||
      !blockchain_hash ||
      !metadata_hash ||
      price == null
    ) {
      return res.status(400).json({
        error:
          "Todos los campos, incluidos ambos hashes y el precio, son requeridos",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Inserta el producto
      const prodRes = await client.query(
        `INSERT INTO products
           (name, description, category, producer_id, origin, production_date,
            blockchain_hash, metadata_hash, is_active, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9)
         RETURNING *`,
        [
          name,
          description,
          category,
          producer_id,
          origin,
          production_date,
          blockchain_hash,
          metadata_hash,
          price,
        ]
      );
      const product = prodRes.rows[0];

      // Crea la custodia inicial
      await client.query(
        `INSERT INTO product_custodies (product_id, user_id, stock)
         VALUES ($1, $2, $3)`,
        [product.id, producer_id, stock]
      );

      // Registra en el historial de producto
      await client.query(
        `INSERT INTO product_history
           (product_id, actor_id, action, location, notes, blockchain_hash)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product.id,
          producer_id,
          "Creación de producto",
          null,
          null,
          blockchain_hash,
        ]
      );

      await client.query("COMMIT");
      res
        .status(201)
        .json({ message: "Producto creado exitosamente", product });
    } catch (error) {
      console.error("Error creando producto:", error);
      await client.query("ROLLBACK");
      res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  }
);

/**
 * GET /products
 * Lista productos (paginado).
 */
router.get(
  "/",
  authenticateToken,
  async (req, res) => {
    const { custody_id, limit = 50, offset = 0 } = req.query;
    const isAdmin = req.user.role === "admin";

    try {
      let query, params;
      if (isAdmin) {
        query = `
          SELECT 
            p.*, 
            pc.stock, 
            pc.user_id AS custody_user_id,
            u.name AS producer_name,
            s.status AS shipment_status
          FROM products p
          JOIN product_custodies pc ON pc.product_id = p.id
          LEFT JOIN users u ON p.producer_id = u.id
          LEFT JOIN LATERAL (
              SELECT status
              FROM shipments
              WHERE product_id = p.id
              ORDER BY created_at DESC, id DESC
              LIMIT 1
          ) s ON true
          WHERE pc.stock > 0 AND p.is_active = TRUE
          ORDER BY p.created_at DESC
          LIMIT $1 OFFSET $2
        `;
        params = [limit, offset];
      } else {
        const userId = custody_id || req.user.id;
        query = `
          SELECT 
            p.*, 
            pc.stock, 
            pc.user_id AS custody_user_id,
            u.name AS producer_name,
            s.status AS shipment_status
          FROM products p
          JOIN product_custodies pc ON pc.product_id = p.id
          LEFT JOIN users u ON p.producer_id = u.id
          LEFT JOIN LATERAL (
              SELECT status
              FROM shipments
              WHERE product_id = p.id
              ORDER BY created_at DESC, id DESC
              LIMIT 1
          ) s ON true
          WHERE pc.user_id = $1 AND pc.stock > 0 AND p.is_active = TRUE
          ORDER BY p.created_at DESC
          LIMIT $2 OFFSET $3
        `;
        params = [userId, limit, offset];
      }
      const result = await pool.query(query, params);
      res.json({
        products: result.rows,
        total: result.rows.length,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (err) {
      console.error("Error obteniendo productos:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

/**
 * POST /products/sales
 * Registra una venta, guarda el hash en sale_transactions y en product_history.
 */
router.post(
  "/sales",
  authenticateToken,
  authorizeRole(["seller", "producer", "admin"]),
  async (req, res) => {
    const { user } = req;
    const {
      product_id,
      buyer_email,
      quantity,
      price_per_unit,
      location,
      notes,
      blockchain_hash,
    } = req.body;

    if (
      !product_id ||
      !buyer_email ||
      !quantity ||
      !price_per_unit ||
      !blockchain_hash
    ) {
      return res
        .status(400)
        .json({ error: "Faltan datos de venta o blockchain_hash" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Buscar comprador
      const buyerRes = await client.query(
        "SELECT id FROM users WHERE email = $1 AND is_active = TRUE",
        [buyer_email]
      );
      if (!buyerRes.rows.length) throw new Error("Comprador no encontrado");
      const buyer_id = buyerRes.rows[0].id;

      // Descontar stock
      const pcRes = await client.query(
        "SELECT stock FROM product_custodies WHERE product_id = $1 AND user_id = $2 FOR UPDATE",
        [product_id, user.id]
      );
      if (
        !pcRes.rows.length ||
        Number(pcRes.rows[0].stock) < Number(quantity)
      ) {
        throw new Error("Stock insuficiente o no posees este producto");
      }
      await client.query(
        "UPDATE product_custodies SET stock = stock - $1 WHERE product_id = $2 AND user_id = $3",
        [quantity, product_id, user.id]
      );
      await client.query(
        `INSERT INTO product_custodies (product_id, user_id, stock)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, user_id)
           DO UPDATE SET stock = product_custodies.stock + EXCLUDED.stock`,
        [product_id, buyer_id, quantity]
      );

      // Insertar venta on‑chain
      const total_amount = Number(quantity) * Number(price_per_unit);
      const saleRes = await client.query(
        `INSERT INTO sale_transactions
           (product_id, seller_id, buyer_id, quantity, price_per_unit, total_amount, location, notes, transaction_date, blockchain_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9)
         RETURNING *`,
        [
          product_id,
          user.id,
          buyer_id,
          quantity,
          price_per_unit,
          total_amount,
          location,
          notes,
          blockchain_hash,
        ]
      );

      // Registrar en historial de producto
      await client.query(
        `INSERT INTO product_history
           (product_id, actor_id, action, location, notes, blockchain_hash)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product_id,
          user.id,
          "Venta de producto",
          location,
          notes || null,
          blockchain_hash,
        ]
      );

      await client.query("COMMIT");
      res
        .status(201)
        .json({ message: "Venta registrada exitosamente", sale: saleRes.rows[0] });
    } catch (err) {
      console.error("Error registrando venta:", err);
      await client.query("ROLLBACK");
      res
        .status(500)
        .json({ error: err.message || "Error interno al registrar venta" });
    } finally {
      client.release();
    }
  }
);

/**
 * POST /products/transfer
 * Transfiere custodia y registra en product_history (con hash opcional).
 */
router.post(
  "/transfer",
  authenticateToken,
  authorizeRole(["producer", "seller", "admin"]),
  async (req, res) => {
    const { user } = req;
    const {
      product_id,
      to_user_id,
      quantity,
      notes,
      blockchain_hash,
    } = req.body;

    if (!product_id || !to_user_id || !quantity) {
      return res
        .status(400)
        .json({ error: "Producto, destino y cantidad requeridos" });
    }
    if (user.id === to_user_id) {
      return res
        .status(400)
        .json({ error: "No puedes transferirte a ti mismo" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Descontar stock del remitente
      const pcRes = await client.query(
        "SELECT stock FROM product_custodies WHERE product_id = $1 AND user_id = $2 FOR UPDATE",
        [product_id, user.id]
      );
      if (
        !pcRes.rows.length ||
        Number(pcRes.rows[0].stock) < Number(quantity)
      ) {
        throw new Error("Stock insuficiente o no posees este producto");
      }
      await client.query(
        "UPDATE product_custodies SET stock = stock - $1 WHERE product_id = $2 AND user_id = $3",
        [quantity, product_id, user.id]
      );
      // Sumar stock al destinatario
      await client.query(
        `INSERT INTO product_custodies (product_id, user_id, stock)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, user_id)
           DO UPDATE SET stock = product_custodies.stock + EXCLUDED.stock`,
        [product_id, to_user_id, quantity]
      );

      // Registrar en historial de producto
      await client.query(
        `INSERT INTO product_history
           (product_id, actor_id, action, location, notes, blockchain_hash)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          product_id,
          user.id,
          "Transferencia de custodia",
          null,
          notes || null,
          blockchain_hash || null,
        ]
      );

      await client.query("COMMIT");
      res
        .status(201)
        .json({ message: "Transferencia realizada exitosamente" });
    } catch (err) {
      console.error("Error realizando transferencia:", err);
      await client.query("ROLLBACK");
      res
        .status(500)
        .json({ error: err.message || "Error interno al transferir" });
    } finally {
      client.release();
    }
  }
);

/**
 * PUT /products/:id
 * Actualiza un producto y su stock, sin modificar historial.
 */
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["producer", "admin"]),
  async (req, res) => {
    const productId = req.params.id;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Solo toggle is_active
      if (
        Object.keys(req.body).length === 1 &&
        req.body.hasOwnProperty("is_active")
      ) {
        const { is_active } = req.body;
        if (typeof is_active !== "boolean") {
          await client.query("ROLLBACK");
          return res
            .status(400)
            .json({ error: "is_active debe ser booleano" });
        }
        const result = await client.query(
          `UPDATE products
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2
           RETURNING *`,
          [is_active, productId]
        );
        if (!result.rows.length) {
          await client.query("ROLLBACK");
          return res.status(404).json({ error: "Producto no encontrado" });
        }
        await client.query("COMMIT");
        return res.json({
          message: `Producto ${productId} marcado ${is_active ? "activo" : "inactivo"}`,
          product: result.rows[0],
        });
      }

      // Actualización general
      const {
        name,
        description,
        category,
        origin,
        production_date,
        metadata_hash,
        is_active,
        stock,
        price,
      } = req.body;

      if (
        !name ||
        !description ||
        !category ||
        !origin ||
        !production_date
      ) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Faltan campos requeridos para el producto." });
      }

      const updateProduct = await client.query(
        `
        UPDATE products
           SET name            = $1,
               description     = $2,
               category        = $3,
               origin          = $4,
               production_date = $5,
               metadata_hash   = COALESCE($6, metadata_hash),
               is_active       = COALESCE($7, is_active),
               price           = COALESCE($8, price),
               updated_at      = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *
        `,
        [
          name,
          description,
          category,
          origin,
          production_date,
          metadata_hash || null,
          typeof is_active === "boolean" ? is_active : null,
          price !== undefined ? price : null,
          productId,
        ]
      );
      if (!updateProduct.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      let newStockRow = null;
      if (typeof stock === "number") {
        const userId = req.user.id;
        const upd = await client.query(
          `UPDATE product_custodies
             SET stock = $1
           WHERE product_id = $2 AND user_id = $3
           RETURNING stock`,
          [stock, productId, userId]
        );
        if (!upd.rows.length) {
          const ins = await client.query(
            `INSERT INTO product_custodies (product_id, user_id, stock)
             VALUES ($1, $2, $3)
             RETURNING stock`,
            [productId, userId, stock]
          );
          newStockRow = ins.rows[0];
        } else {
          newStockRow = upd.rows[0];
        }
      }

      await client.query("COMMIT");
      return res.json({
        product: updateProduct.rows[0],
        ...(newStockRow ? { stock: newStockRow.stock } : {}),
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error actualizando producto:", err);
      return res
        .status(500)
        .json({ error: "Error interno al actualizar producto" });
    } finally {
      client.release();
    }
  }
);

router.get(
  "/:id/history",
  authenticateToken,
  async (req, res) => {
    const productId = Number(req.params.id);
    if (!productId) {
      return res.status(400).json({ error: "product_id inválido" });
    }
    try {
      const q = `
        SELECT
          id,
          action,
          timestamp,
          notes,
          location,
          blockchain_hash
        FROM product_history
        WHERE product_id = $1
        ORDER BY timestamp DESC
        LIMIT 100
      `;
      const { rows } = await pool.query(q, [productId]);
      res.json({ history: rows });
    } catch (err) {
      console.error("Error leyendo historial de producto:", err);
      res.status(500).json({ error: "Error interno" });
    }
  }
);

module.exports = router;