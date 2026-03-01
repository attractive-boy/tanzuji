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
  // Try to get a connection with retries to tolerate transient DB network issues
  let conn;
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      conn = await pool.getConnection();
      break;
    } catch (err) {
      console.error(`DB connect attempt ${attempt} failed:`, err && err.message);
      if (attempt === maxAttempts) throw err;
      await new Promise(r => setTimeout(r, attempt * 500));
    }
  }
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
    await conn.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(128),
        badge_id VARCHAR(128),
        metadata JSON,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_badge_unique (user_id, badge_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } finally {
    if (conn) conn.release();
  }
}

module.exports = { pool, init };
