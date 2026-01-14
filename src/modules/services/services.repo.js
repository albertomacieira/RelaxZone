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

module.exports = { listActive, findById, create, update, softDelete };


