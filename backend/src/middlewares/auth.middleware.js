const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { db } = require("../db/memory.db");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Token ausente" });

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = db.users.find(u => u.id === payload.sub);

    if (!user) return res.status(401).json({ message: "Usuário inválido" });

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      userType: user.userType
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

module.exports = { requireAuth };
