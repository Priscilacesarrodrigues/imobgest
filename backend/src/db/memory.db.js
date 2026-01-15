const bcrypt = require("bcryptjs");

const passwordHash = bcrypt.hashSync("123456", 10);

const db = {
  users: [
    { id: "u1", name: "Hiran", email: "hiran@empresa.com", passwordHash, roles: ["HIRAN"], userType: "INTERNO" },
    { id: "u2", name: "Paulo", email: "paulo@empresa.com", passwordHash, roles: ["PAULO"], userType: "INTERNO" },
    { id: "u3", name: "AAV", email: "aav@empresa.com", passwordHash, roles: ["AAV"], userType: "INTERNO" },
    { id: "u4", name: "Corretor", email: "corretor@externo.com", passwordHash, roles: ["CORRETOR"], userType: "EXTERNO" }
  ],
  proposals: [],
  approvals: []
};

module.exports = { db };
