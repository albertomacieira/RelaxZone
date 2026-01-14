const { getPool } = require("../../db/pool");

async function list({ userId } = {}) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    if (userId) {
      const rows = await conn.query(
        `
        SELECT 
          b.id, b.user_id, b.service_id, b.start_at, b.end_at, b.status, b.created_at,
          s.name AS service_name, s.duration_min, s.price_cents, s.image_url
        FROM bookings b
        JOIN services s ON s.id = b.service_id
        WHERE b.user_id = ?
        ORDER BY b.start_at DESC
        `,
        [userId]
      );
      return rows;
    }

    const rows = await conn.query(
      `
      SELECT 
        b.id, b.user_id, b.service_id, b.start_at, b.end_at, b.status, b.created_at,
        s.name AS service_name, s.duration_min, s.price_cents, s.image_url
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      ORDER BY b.start_at DESC
      `
    );
    return rows;
  } finally {
    conn.release();
  }
}

async function create({ userId, serviceId, startAt, endAt, status }) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `
      INSERT INTO bookings (user_id, service_id, start_at, end_at, status)
      VALUES (?, ?, ?, ?, ?)
      `,
      [userId, serviceId, startAt, endAt, status]
    );

    const insertedId = Number(result.insertId);

    const rows = await conn.query(
      `
      SELECT 
        b.id, b.user_id, b.service_id, b.start_at, b.end_at, b.status, b.created_at,
        s.name AS service_name, s.duration_min, s.price_cents, s.image_url
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.id = ?
      `,
      [insertedId]
    );

    return rows[0];
  } finally {
    conn.release();
  }
}

async function updateStatus(bookingId, status) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const id = Number(bookingId);

    const result = await conn.query(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (!result.affectedRows) {
      throw new Error("Booking not found");
    }

    const rows = await conn.query(
      `
      SELECT 
        b.id, b.user_id, b.service_id, b.start_at, b.end_at, b.status, b.created_at,
        s.name AS service_name, s.duration_min, s.price_cents, s.image_url
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.id = ?
      `,
      [id]
    );

    return rows[0];
  } finally {
    conn.release();
  }
}

async function findRawById(bookingId) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const id = Number(bookingId);
    const rows = await conn.query(
      `SELECT id, user_id, service_id, start_at, end_at, status, created_at
       FROM bookings WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

async function findById(bookingId) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    const id = Number(bookingId);
    const rows = await conn.query(
      `
      SELECT 
        b.id, b.user_id, b.service_id, b.start_at, b.end_at, b.status, b.created_at,
        s.name AS service_name, s.duration_min, s.price_cents, s.image_url
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      WHERE b.id = ?
      `,
      [id]
    );
    return rows[0] || null;
  } finally {
    conn.release();
  }
}

async function existsOverlapForUser({ userId, startAt, endAt }) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const rows = await conn.query(
      `
      SELECT 1
      FROM bookings
      WHERE user_id = ?
        AND status <> 'CANCELLED'
        AND start_at < ?
        AND end_at > ?
      LIMIT 1
      `,
      [userId, endAt, startAt]
    );

    return rows.length > 0;
  } finally {
    conn.release();
  }
}

module.exports = { list, create, updateStatus, findRawById, findById, existsOverlapForUser };