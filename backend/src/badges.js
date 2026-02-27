const { pool } = require('./db');

// Simple badge rules engine. Returns array of awarded badge objects.
async function evaluateForEntry(entry) {
  const awarded = [];
  const conn = await pool.getConnection();
  try {
    // First-entry badge
    const [[countRow]] = await conn.query('SELECT COUNT(*) AS c FROM ledger WHERE user_id = ?', [entry.user_id]);
    if (countRow && countRow.c === 1) {
      // This is the first entry (including the one just inserted)
      const badge = { badge_id: 'first_entry', metadata: { note: 'First carbon entry' } };
      await insertBadgeIfNotExists(conn, entry.user_id, badge);
      awarded.push(badge);
    }

    // Eco short trip: transport entries under 1 kg CO2e
    if (entry.type === 'transport' && entry.kgco2e != null && entry.kgco2e < 1) {
      const badge = { badge_id: 'eco_short_trip', metadata: { kgco2e: entry.kgco2e } };
      await insertBadgeIfNotExists(conn, entry.user_id, badge);
      awarded.push(badge);
    }

    // Low monthly footprint (example rule): user monthly total < 50 kg
    // Simple check: sum last 30 days
    const [sumRows] = await conn.query('SELECT IFNULL(SUM(kgco2e),0) as s FROM ledger WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)', [entry.user_id]);
    const monthly = sumRows && sumRows[0] ? sumRows[0].s : 0;
    if (monthly < 50) {
      const badge = { badge_id: 'low_monthly_footprint', metadata: { monthly_kg: monthly } };
      await insertBadgeIfNotExists(conn, entry.user_id, badge);
      awarded.push(badge);
    }

    return awarded;
  } finally {
    conn.release();
  }
}

async function insertBadgeIfNotExists(conn, user_id, badge) {
  try {
    await conn.query('INSERT INTO badges (user_id, badge_id, metadata) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE metadata = metadata', [user_id, badge.badge_id, JSON.stringify(badge.metadata || {})]);
  } catch (err) {
    console.error('insertBadge failed', err);
  }
}

async function listBadgesForUser(user_id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT badge_id, metadata, awarded_at FROM badges WHERE user_id = ? ORDER BY awarded_at DESC', [user_id]);
    return rows;
  } finally {
    conn.release();
  }
}

module.exports = { evaluateForEntry, listBadgesForUser };
