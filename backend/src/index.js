const express = require('express');
const bodyParser = require('body-parser');
const { pool, init } = require('./db');
const calc = require('../shared/src/calculator');

const app = express();
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ ok: true }));

// Get factors (simple list)
app.get('/factors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM factors LIMIT 1000');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

// Add a ledger entry and compute kgCO2e
app.post('/ledger', async (req, res) => {
  try {
    const { user_id, type, amount, unit, meta, scope } = req.body;
    if (!type || amount == null) return res.status(400).json({ error: 'missing_fields' });

    // Compute kgCO2e using shared calculator
    const activity = { type, amount, unit, meta };
    const kgco2e = calc.calculateActivity(activity);

    const [result] = await pool.query('INSERT INTO ledger (user_id, type, amount, unit, meta, kgco2e, scope) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, type, amount, unit || null, JSON.stringify(meta || {}), kgco2e, scope || null]);

    const [rows] = await pool.query('SELECT * FROM ledger WHERE id = ?', [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

// List ledger entries (paginated)
app.get('/ledger', async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit || '50'));
  const offset = parseInt(req.query.offset || '0');
  try {
    const [rows] = await pool.query('SELECT * FROM ledger ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db_error' });
  }
});

// Start server after DB init
const PORT = process.env.PORT || 3001;
init().then(() => {
  app.listen(PORT, () => console.log('Backend listening on', PORT));
}).catch(err => {
  console.error('Failed DB init', err);
  process.exit(1);
});
