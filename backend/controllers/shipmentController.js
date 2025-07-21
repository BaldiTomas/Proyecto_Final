const poolShip = require("../db")

exports.createShipment = async (req, res) => {
  try {
    const { product_id, origin, destination, transport_company, quantity, notes } = req.body
    if (![product_id, origin, destination, quantity].every(Boolean)) return res.status(400).json({ error: "Campos faltantes" })
    const prod = await poolShip.query("SELECT current_custody_id FROM products WHERE id=$1 AND is_active=TRUE", [product_id])
    if (!prod.rows.length) return res.status(404).json({ error: "Producto no encontrado" })
    if (prod.rows[0].current_custody_id !== req.user.id) return res.status(403).json({ error: "No custodia" })
    const ins = await poolShip.query(
      `INSERT INTO shipments (product_id,distributor_id,origin,destination,transport_company,quantity,notes)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [product_id,req.user.id,origin,destination,transport_company,quantity,notes]
    )
    const id=ins.rows[0].id
    await Promise.all([
      poolShip.query(
        "INSERT INTO product_history (product_id,actor_id,action,location,notes) VALUES($1,$2,'shipped',$3,$4)",
        [product_id,req.user.id,origin,`Hacia ${destination}. Cant: ${quantity}`]
      ),
      poolShip.query(
        "INSERT INTO system_logs (user_id,action,entity_type,entity_id,details) VALUES($1,'shipment_created','shipment',$2,$3)",
        [req.user.id,id,JSON.stringify({product_id,origin,destination,quantity})]
      )
    ])
    res.status(201).json({ message:"Envío creado", shipment:{ id,product_id,distributor_id:req.user.id,origin,destination,transport_company,quantity,status:'in_transit' } })
  } catch(err){ console.error(err); res.status(500).json({error:"Error"}) }
}

exports.listShipments = async (req, res) => {
  try {
    const { distributor_id, status, limit=50, offset=0 } = req.query
    const params = [], where=["1=1"]
    if(req.user.role!="admin"){ params.push(req.user.id);where.push(`s.distributor_id=$${params.length}`) }
    else if(distributor_id){params.push(distributor_id);where.push(`s.distributor_id=$${params.length}`)}
    if(status){params.push(status);where.push(`s.status=$${params.length}`)}
    params.push(+limit,+offset)
    const q =`
      SELECT s.*,p.name prod,u.name dist FROM shipments s
      JOIN products p ON p.id=s.product_id
      JOIN users u ON u.id=s.distributor_id
      WHERE ${where.join(" AND ")}
      ORDER BY s.created_at DESC
      LIMIT $${params.length-1} OFFSET $${params.length}`
    const {rows} = await poolShip.query(q,params)
    res.json({ shipments:rows,total:rows.length })
  } catch(err){ console.error(err); res.status(500).json({error:"Error"}) }
}

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if(!["delivered","cancelled"].includes(status)) return res.status(400).json({error:"Estado inválido"})
    const ship=await poolShip.query("SELECT product_id,destination FROM shipments WHERE id=$1 AND distributor_id=$2",[id,req.user.id])
    if(!ship.rows.length) return res.status(404).json({error:"No encontrado"})
    await poolShip.query("UPDATE shipments SET status=$1,updated_at=NOW() WHERE id=$2",[status,id])
    await poolShip.query(
      "INSERT INTO product_history (product_id,actor_id,action,location,notes) VALUES($1,$2,$3,$4,$5)",
      [ship.rows[0].product_id,req.user.id,status,ship.rows[0].destination,status==='delivered'?'entregado':'cancelado']
    )
    res.json({message:`Estado actualizado a ${status}`})
  }catch(err){ console.error(err); res.status(500).json({error:"Error"}) }
}