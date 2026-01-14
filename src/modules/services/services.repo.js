// src/modules/services/services.repo.js
const { getPool } = require('../../db/pool');

const listActive = async () => {
  const pool = getPool();
  const rows = await pool.query(
    `SELECT id, name, description, duration_min, price_cents, image_url, is_active, created_at
     FROM services
     WHERE is_active = 1
     ORDER BY id ASC`
  );
  return rows;
};

const listPopular = async (limit = 3) => {
  const pool = getPool();
  const top = await pool.query(
    `SELECT 
      CAST(s.id AS SIGNED) AS id,
      s.name,
      s.description,
      CAST(s.duration_min AS SIGNED) AS duration_min,
      CAST(s.price_cents AS SIGNED) AS price_cents,
      s.image_url,
      CAST(s.is_active AS SIGNED) AS is_active,
      s.created_at,
      CAST(COALESCE(COUNT(b.id), 0) AS SIGNED) AS bookings_count
     FROM services s
     LEFT JOIN bookings b
       ON b.service_id = s.id AND b.status <> 'CANCELLED'
     WHERE s.is_active = 1
     GROUP BY s.id
     ORDER BY bookings_count DESC, s.id ASC
     LIMIT ?`,
    [Number(limit) || 3]
  );
  return top;
};

const findById = async (serviceId) => {
  const pool = getPool();
  const rows = await pool.query(
    `SELECT id, name, description, duration_min, price_cents, image_url, is_active, created_at
     FROM services
     WHERE id = ?`,
    [serviceId]
  );
  return rows[0] || null;
};

const create = async ({ name, description, duration_min, price_cents, image_url }) => {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO services (name, description, duration_min, price_cents, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [name, description || null, duration_min, price_cents, image_url || null]
  );

  return findById(result.insertId);
};

const update = async (serviceId, changes) => {
  const pool = getPool();

  const allowed = ['name', 'description', 'duration_min', 'price_cents', 'image_url', 'is_active'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (changes[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(changes[key]);
    }
  }

  if (fields.length === 0) return findById(serviceId);

  values.push(serviceId);

  await pool.query(
    `UPDATE services SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return findById(serviceId);
};

const softDelete = async (serviceId) => {
  const pool = getPool();
  await pool.query(`UPDATE services SET is_active = 0 WHERE id = ?`, [serviceId]);
};

module.exports = { listActive, listPopular, findById, create, update, softDelete };


