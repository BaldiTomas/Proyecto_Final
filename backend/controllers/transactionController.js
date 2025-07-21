const pool = require('../db');

// Crear transacción
exports.createTransaction = async (req, res) => {
  try {
    const { product_id, buyer_email, quantity, price_per_unit, location, notes } = req.body;
    if (![product_id, buyer_email, quantity, price_per_unit].every(Boolean)) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const buyerRes = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND is_active = TRUE',
      [buyer_email]
    );
    if (!buyerRes.rows.length) {
      return res.status(404).json({ error: 'Comprador no encontrado' });
    }
    const buyer_id = buyerRes.rows[0].id;
    const total_amount = quantity * price_per_unit;

    const insertRes = await pool.query(
      `INSERT INTO sale_transactions
        (product_id, seller_id, buyer_id, quantity, price_per_unit, total_amount, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [product_id, req.user.id, buyer_id, quantity, price_per_unit, total_amount, location, notes]
    );
    const transactionId = insertRes.rows[0].id;

    await Promise.all([
      pool.query(
        `INSERT INTO product_history
           (product_id, actor_id, action, location, notes)
         VALUES ($1,$2,'sale_created',$3,$4)`,
        [product_id, req.user.id, location, `Cantidad: ${quantity}`]
      ),
      pool.query(
        `INSERT INTO system_logs
           (user_id, action, entity_type, entity_id, details)
         VALUES ($1,'transaction_created','transaction',$2,$3)`,
        [req.user.id, transactionId, JSON.stringify({ product_id, total_amount })]
      )
    ]);

    res.status(201).json({
      message: 'Transacción creada exitosamente',
      transaction: {
        id: transactionId,
        product_id,
        seller_id: req.user.id,
        buyer_id,
        quantity,
        price_per_unit,
        total_amount,
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('Error creando transacción:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar transacciones
exports.listTransactions = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const params = [req.user.id];
    const where = ['(st.seller_id = $1 OR st.buyer_id = $1)'];

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
      WHERE ${where.join(' AND ')}
      ORDER BY st.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;
    const result = await pool.query(query, params);
    res.json({ transactions: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Error obteniendo transacciones:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
