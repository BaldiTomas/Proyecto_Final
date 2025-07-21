const poolProd = require("../db")

const checkPerm = async (id, user) => {
  const res = await poolProd.query("SELECT producer_id FROM products WHERE id=$1 AND is_active=TRUE", [id])
  if (!res.rows.length) throw { status: 404, message: "Producto no encontrado" }
  if (user.role!="admin"&&res.rows[0].producer_id!==user.id) throw { status: 403, message: "Permisos insuficientes" }
  return res.rows[0]
}

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, origin="Origen Desconocido", production_date=new Date().toISOString().slice(0,10) } = req.body
    if (![name, description].every(Boolean)) return res.status(400).json({ error: "Nombre y descripción son requeridos" })
    const { rows } = await poolProd.query(
      `INSERT INTO products (name,description,category,producer_id,origin,production_date,current_custody_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [name,description,category,req.user.id,origin,production_date,req.user.id]
    )
    const id = rows[0].id
    await Promise.all([
      poolProd.query(
        "INSERT INTO product_history (product_id,actor_id,action,location,notes) VALUES ($1,$2,'created',$3,'registrado')",
        [id,req.user.id,origin]
      ),
      poolProd.query(
        "INSERT INTO system_logs (user_id,action,entity_type,entity_id,details) VALUES ($1,'product_created','product',$2,$3)",
        [req.user.id,id,JSON.stringify({name,description,category})]
      )
    ])
    res.status(201).json({ message: "Producto registrado exitosamente", product: { id,name,description,category,producer_id:req.user.id,origin,production_date } })
  } catch(err) { console.error(err); const s=err.status||500; res.status(s).json({ error: err.message||"Error interno" }) }
}

exports.listProducts = async (req, res) => {
  try {
    const { category, producer_id, limit=50, offset=0 } = req.query
    const filters=["p.is_active=TRUE"], params=[]
    if(category){params.push(category);filters.push(`p.category=$\${params.length}`)}
    if(producer_id){params.push(producer_id);filters.push(`p.producer_id=$\${params.length}`)}
    const where = filters.join(" AND ")
    params.push(+limit, +offset)
    const query = 
      `SELECT p.*,u.name prod_name,u.email prod_email,c.name custody, COUNT(ph.id) hist
       FROM products p
       JOIN users u ON p.producer_id=u.id
       LEFT JOIN users c ON p.current_custody_id=c.id
       LEFT JOIN product_history ph ON ph.product_id=p.id
       WHERE \${where}
       GROUP BY p.id,u.name,u.email,c.name
       ORDER BY p.created_at DESC
       LIMIT $\${params.length-1} OFFSET $\${params.length}`

    const r=await poolProd.query(query,params)
    const countR=await poolProd.query(`SELECT COUNT(*) FROM products p WHERE \${where}`,params.slice(0,params.length-2))
    res.json({ products:r.rows, total:+countR.rows[0].count, limit:+limit, offset:+offset })
  } catch(err){ console.error(err); res.status(500).json({ error:"Error interno" }) }
}

exports.getProduct = async (req, res) => {
  try {
    const id=req.params.id
    const pr=await poolProd.query(
      `SELECT p.*,u.name prod_name,u.email prod_email,c.name custody
       FROM products p
       JOIN users u ON p.producer_id=u.id
       LEFT JOIN users c ON p.current_custody_id=c.id
       WHERE p.id=$1 AND p.is_active=TRUE`,[id]
    )
    if(!pr.rows.length) return res.status(404).json({error:"No encontrado"})
    const hist=await poolProd.query(
      `SELECT ph.*,u.name actor,u.role actor_role
       FROM product_history ph
       JOIN users u ON ph.actor_id=u.id
       WHERE ph.product_id=$1 ORDER BY ph.timestamp DESC`,[id]
    )
    const p=pr.rows[0]; p.history=hist.rows
    res.json(p)
  }catch(err){ console.error(err); res.status(500).json({error:"Error interno"}) }
}

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id
    const { name, description, category } = req.body
    if (![name,description].every(Boolean)) return res.status(400).json({ error: "Nombre y descripción" })
    await checkPerm(id,req.user)
    await poolProd.query(
      `UPDATE products SET name=$1,description=$2,category=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$4`,
      [name,description,category,id]
    )
    await poolProd.query(
      `INSERT INTO product_history (product_id,actor_id,action,notes) VALUES ($1,$2,'updated','info actualizada')`,
      [id,req.user.id]
    )
    res.json({ message:"Producto actualizado" })
  }catch(err){ console.error(err); const s=err.status||500; res.status(s).json({error:err.message||"Error"}) }
}

exports.deleteProduct = async (req, res) => {
  try {
    const id=req.params.id
    await checkPerm(id,req.user)
    await poolProd.query(
      `UPDATE products SET is_active=FALSE,updated_at=CURRENT_TIMESTAMP WHERE id=$1`,[id]
    )
    await poolProd.query(
      `INSERT INTO product_history (product_id,actor_id,action,notes) VALUES($1,$2,'deactivated','desactivado')`,
      [id,req.user.id]
    )
    res.json({ message:"Producto desactivado" })
  }catch(err){ console.error(err); const s=err.status||500; res.status(s).json({error:err.message||"Error"}) }
}