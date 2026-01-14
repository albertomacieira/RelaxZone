const { getPool } = require("../../db/pool");

async function list({ q, role, is_active, limit, offset }) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const where = [];
    const params = [];

    if (q) {
      where.push("(u.name LIKE ? OR u.email LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    if (role) {
      where.push("u.role = ?");
      params.push(role);
    }

    if (typeof is_active !== "undefined") {
      // chega como "0"/"1" muitas vezes
      const v = Number(is_active);
      if (Number.isFinite(v)) {
        where.push("u.is_active = ?");
        params.push(v);
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 50;
    const safeOffset = Number.isFinite(Number(offset)) ? Number(offset) : 0;
    const rows = await conn.query(
      `
      SELECT
        u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at
      FROM users u
      ${whereSql}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, safeLimit, safeOffset]
    );

    return rows;
  } finally {
    conn.release();
  }
}

async function findById(userId) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const id = Number(userId);
    const rows = await conn.query(
      `
      SELECT
        u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at
      FROM users u
      WHERE u.id = ?
      `,
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

async function updateRole(userId, role) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const id = Number(userId);
    const result = await conn.query(
      `UPDATE users SET role = ? WHERE id = ?`,
      [role, id]
    );
    return !!result.affectedRows;
  } finally {
    conn.release();
  }
}

async function updateActive(userId, isActive) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const id = Number(userId);
    const result = await conn.query(
      `UPDATE users SET is_active = ? WHERE id = ?`,
      [Number(isActive), id]
    );
    return !!result.affectedRows;
  } finally {
    conn.release();
  }
}

module.exports = { list, findById, updateRole, updateActive };
