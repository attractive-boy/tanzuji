const { pool, init } = require('../backend/src/db');

async function seed() {
  await init();
  const conn = await pool.getConnection();
  try {
    const factors = [
      { id: 'electricity_global_avg', category: 'electricity', unit: 'kWh', value: 475, source: 'ourworldindata', region: 'global', version: 'v1' },
      { id: 'transport_petrol_avg', category: 'transport', unit: 'km', value: 192, source: 'defra', region: 'global', version: 'v1' },
      { id: 'transport_diesel_avg', category: 'transport', unit: 'km', value: 171, source: 'defra', region: 'global', version: 'v1' },
      { id: 'food_beef', category: 'food', unit: 'kg', value: 6000, source: 'poore', region: 'global', version: 'v1' },
      { id: 'spend_default', category: 'purchase', unit: 'currency', value: 500, source: 'exiobase_est', region: 'global', version: 'v1' }
    ];

    for (const f of factors) {
      await conn.query('INSERT INTO factors (id, category, unit, value, source, region, version, effective_date) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE()) ON DUPLICATE KEY UPDATE value = VALUES(value), source=VALUES(source), region=VALUES(region), version=VALUES(version), effective_date=VALUES(effective_date)',
        [f.id, f.category, f.unit, f.value, f.source, f.region, f.version]);
    }

    console.log('Seeded factors');
  } catch (err) {
    console.error('Seed failed', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
