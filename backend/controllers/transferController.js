const pool = require('../db');

// Iniciar transferencia
exports.createTransfer = async (req, res) => {
  try {
    const { product_id, to_user_email, quantity, notes } = req.body;
    if (![product_id, to_user_email, quantity].every(Boolean)) {
      return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
    }

    const userRes = await pool.query(
      'SELECT id, name FROM users WHERE email = $1 AND is_active = TRUE',
      [to_user_email]
    );
    if (!userRes.rows.length) return res.status(404).json({ error: 'Usuario receptor no encontrado' });
    const toUser = userRes.rows[0];

    const prodRes = await pool.query(
      'SELECT current_custody_id FROM products WHERE id = $1 AND is_active = TRUE',
      [product_id]
    );
    if (!prodRes.rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    if (prodRes.rows[0].current_custody_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes custodia de este producto' });
    }

    const insertRes = await pool.query(
      `INSERT INTO product_transfers
        (product_id, from_user_id, to_user_id, quantity, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [product_id, req.user.id, toUser.id, quantity, notes]
    );
    const transferId = insertRes.rows[0].id;

    await Promise.all([
      pool.query(
        `INSERT INTO product_history
           (product_id, actor_id, action, notes)
         VALUES ($1,$2,'transfer_initiated',$3)`,
        [product_id, req.user.id, `Hacia ${toUser.name}. Cantidad: ${quantity}`]
      ),
      pool.query(
        `INSERT INTO system_logs
           (user_id, action, entity_type, entity_id, details)
         VALUES ($1,'transfer_initiated','transfer',$2,$3)`,
        [req.user.id, transferId, JSON.stringify({ product_id, to_user: toUser.id, quantity })]
      )
    ]);

    res.status(201).json({
      message: 'Transferencia iniciada exitosamente',
      transfer: {
        id: transferId,
        product_id,
        from_user_id: req.user.id,
        to_user_id: toUser.id,
        quantity,
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('Error iniciando transferencia:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar transferencias
exports.listTransfers = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const params = [req.user.id];
    const where = ['(pt.from_user_id = $1 OR pt.to_user_id = $1)'];

    if (status) {
      params.push(status);
      where.push(`pt.status = $${params.length}`);
    }
    params.push(Number(limit), Number(offset));

    const query = `
      SELECT pt.*, p.name AS product_name,
             fu.name AS from_user_name, tu.name AS to_user_name
      FROM product_transfers pt
        JOIN products p ON pt.product_id = p.id
        JOIN users fu ON pt.from_user_id = fu.id
        JOIN users tu ON pt.to_user_id = tu.id
      WHERE ${where.join(' AND ')}
      ORDER BY pt.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;
    const result = await pool.query(query, params);
    res.json({ transfers: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error obteniendo transferencias:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Completar transferencia
exports.completeTransfer = async (req, res) => {
  try {
    const transferId = req.params.id;
    const tRes = await pool.query(
      "SELECT * FROM product_transfers WHERE id = $1 AND status = 'pending'",
      [transferId]
    );
    if (!tRes.rows.length) {
      return res.status(404).json({ error: 'Transferencia no encontrada o ya procesada' });
    }
    const t = tRes.rows[0];
    if (![t.from_user_id, t.to_user_id].includes(req.user.id)) {
      return res.status(403).json({ error: 'No autorizado para completar esta transferencia' });
    }

    await pool.query(
      "UPDATE product_transfers SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [transferId]
    );
    await pool.query(
      "UPDATE products SET current_custody_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [t.to_user_id, t.product_id]
    );
    await pool.query(
      "INSERT INTO product_history (product_id, actor_id, action, notes) VALUES ($1,$2,'transfer_completed','Nueva custodia asignada')",
      [t.product_id, req.user.id]
    );

    res.json({ message: 'Transferencia completada exitosamente' });
  } catch (err) {
    console.error('Error completando transferencia:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
