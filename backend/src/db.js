const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tanzuji',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

async function init() {
  const conn = await pool.getConnection();
  try {
    // Create simple tables if they don't exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS factors (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(64),
        unit VARCHAR(32),
        value DOUBLE,
        source VARCHAR(256),
        region VARCHAR(64),
        version VARCHAR(32),
        effective_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ledger (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(128),
        type VARCHAR(64),
        amount DOUBLE,
        unit VARCHAR(32),
        meta JSON,
        kgco2e DOUBLE,
        scope VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } finally {
    conn.release();
  }
}

module.exports = { pool, init };
