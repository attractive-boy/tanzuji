const fs = require('fs');
const path = require('path');
const { pool, init } = require('../backend/src/db');

async function importCsv(filePath) {
  await init();
  const data = fs.readFileSync(filePath, 'utf8');
  const lines = data.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',').map(h => h.trim());
  const conn = await pool.getConnection();
  try {
    for (const line of lines) {
      const cols = line.split(',').map(c => c.trim());
      const row = {};
      header.forEach((h, i) => row[h] = cols[i]);
      const id = row.id || (row.category + '_' + Math.random().toString(36).slice(2,8));
      await conn.query('INSERT INTO factors (id, category, unit, value, source, region, version, effective_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE value=VALUES(value), source=VALUES(source), region=VALUES(region), version=VALUES(version), effective_date=VALUES(effective_date)', [id, row.category, row.unit, parseFloat(row.value || 0), row.source, row.region || 'global', row.version || 'v1', row.effective_date || null]);
    }
    console.log('Import completed');
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  const csv = process.argv[2] || path.join(__dirname, '../data/defra_transport_sample.csv');
  importCsv(csv).then(() => process.exit(0)).catch(err => { console.error(err); process.exit(2); });
}
