const express = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const { db } = require("../db/memory.db");

const router = express.Router();
router.use(requireAuth);

// GET /proposals  -> lista
router.get("/", (req, res) => {
  const isInternal = req.user.userType === "INTERNO";

  const proposals = isInternal
    ? db.proposals
    : db.proposals.filter(p => p.createdBy === req.user.id);

  res.json({ proposals });
});

// POST /proposals -> cria
router.post("/", (req, res) => {
  const id = `p_${Date.now()}`;

  const proposal = {
    id,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    currentStage: 1,
    overallStatus: "EM_ANDAMENTO",
    stages: [
      { stageNumber: 1, status: "EM_ANDAMENTO", data: {}, updatedAt: new Date().toISOString() },
      { stageNumber: 2, status: "NAO_INICIADO", data: {}, updatedAt: new Date().toISOString() },
      { stageNumber: 3, status: "NAO_INICIADO", data: {}, updatedAt: new Date().toISOString() },
      { stageNumber: 4, status: "NAO_INICIADO", data: {}, updatedAt: new Date().toISOString() },
      { stageNumber: 5, status: "NAO_INICIADO", data: {}, updatedAt: new Date().toISOString() }
    ]
  };

  db.proposals.push(proposal);

  res.status(201).json({ proposal });
});

module.exports = router;
