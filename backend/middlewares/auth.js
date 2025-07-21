// middlewares/auth.js
const jwt = require("jsonwebtoken");
const pool = require("../db"); // Asegúrate de que esta ruta sea correcta y tu pool esté bien configurado

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn("Acceso denegado: No se proporcionó token.");
    // ¡Asegura que siempre envía JSON!
    return res.status(401).json({ error: "Token de acceso requerido." });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, userPayload) => {
    if (err) {
      console.error("Token inválido o expirado:", err.message);
      // ¡Asegura que siempre envía JSON!
      return res.status(403).json({ error: "Token inválido o expirado." });
    }

    try {
      const dbUserResult = await pool.query(
        "SELECT id, name, role FROM public.users WHERE id = $1",
        [userPayload.id]
      );

      if (dbUserResult.rows.length === 0) {
        console.error(`Usuario con ID ${userPayload.id} del token no encontrado en la base de datos.`);
        // ¡Asegura que siempre envía JSON!
        return res.status(403).json({ error: "Usuario no encontrado o no autorizado." });
      }

      req.user = dbUserResult.rows[0];
      next();
    } catch (dbError) {
      console.error("Error al verificar el usuario en la base de datos:", dbError);
      // ¡Asegura que siempre envía JSON!
      return res.status(500).json({ error: "Error interno de autenticación." });
    }
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      console.warn("Error de autorización: req.user o req.user.role no está disponible después de la autenticación.");
      // ¡Asegura que siempre envía JSON!
      return res.status(403).json({ error: "No autenticado o rol no disponible." });
    }

    const userRole = req.user.role.toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.warn(
        `Acceso denegado para el rol '${userRole}'. Se requiere uno de: ${allowedRoles.join(", ")}`
      );

      return res.status(403).json({ error: "Permisos insuficientes para esta acción." });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
};