const { getPool } = require("../../db/pool");

async function findByEmail(email) {
  const pool = getPool();
  const rows = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const pool = getPool();
  const rows = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

async function createUser({ name, email, phone, password_hash, role }) {
  const pool = getPool();

  const result = await pool.query(
    "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone || null, password_hash, role]
  );

  const id = Number(result.insertId);
  return findById(id);
}

module.exports = { findByEmail, findById, createUser };

