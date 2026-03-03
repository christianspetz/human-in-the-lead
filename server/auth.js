const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "prism-dev-secret-change-in-production";
const TOKEN_EXPIRY = "7d";

// In-memory user store for now (will be replaced by DB in next commit)
// Seed with a default admin user
const users = [
  { id: "1", email: "admin@humaninthelead.ai", passwordHash: bcrypt.hashSync("prism2026", 10), role: "admin", name: "Admin" },
];

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

function authMiddleware(req, res, next) {
  const token = req.cookies?.prism_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });
  req.user = decoded;
  next();
}

module.exports = { users, createToken, verifyToken, authMiddleware };
