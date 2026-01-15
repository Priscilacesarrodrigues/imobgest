const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const proposalRoutes = require("./routes/proposal.routes"); 

const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));

app.use(express.json());

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// rotas
app.use("/auth", authRoutes);
app.use("/proposals", proposalRoutes);

module.exports = app;
