const mariadb = require("mariadb");

let pool = null;
let connected = false;

function getPool() {
  if (!pool) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error("Missing DB env vars (DB_HOST, DB_USER, DB_NAME, ...)");
    }

    pool = mariadb.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 10,
    });
  }
  return pool;
}

const connectPool = async () => {
  if (connected) return;

  const p = getPool();
  const conn = await p.getConnection();
  await conn.ping();
  conn.release();

  connected = true;
  console.log("[DB] MariaDB ligado com sucesso");
};

const disconnectPool = async () => {
  if (!pool) return;

  await pool.end();
  pool = null;
  connected = false;
  console.log("[DB] Pool terminado");
};

module.exports = { getPool, connectPool, disconnectPool };

