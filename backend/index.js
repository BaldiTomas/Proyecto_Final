// index.js (Backend - NO REQUIERE CAMBIOS)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes        = require("./routes/auth");
const userRoutes        = require("./routes/users");
const productRoutes     = require("./routes/products");
const distributorRoutes = require("./routes/distributor");
const transactionRoutes = require("./routes/transactions");
const statsRoutes       = require("./routes/stats");
const productTransfersRouter = require('./routes/product-transfers');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: "Demasiadas solicitudes, intenta más tarde" },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/distributor", distributorRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/distributor/transfers", productTransfersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, res, ) => {
  console.error("Error no manejado:", err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;