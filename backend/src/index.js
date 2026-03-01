const express = require('express');
const bodyParser = require('body-parser');
const { pool, init } = require('./db');
const calc = require('./calculator');
const badges = require('./badges');
const { requireApiToken, register, login, verifyToken } = require('./auth');

const app = express();
app.use(bodyParser.json());

// CORS middleware for local dev and frontend integration
app.use((req, res, next) => {
  const allowed = process.env.CORS_ORIGIN || '*';
  res.header('Access-Control-Allow-Origin', allowed);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/health', (req, res) => res.json({ ok: true }));

// Simple info endpoint
app.get('/info', (req, res) => res.json({ service: 'carbon-backend', version: '0.1.0' }));

// Get factors (simple list)
app.get('/factors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM factors LIMIT 1000');
    res.json(rows);
  } catch (err) {
    console.error('factors error', err);
    const payload = { error: 'db_error' };
    if (process.env.NODE_ENV !== 'production') payload.message = err.message;
    res.status(500).json(payload);
  }
});

// Add a ledger entry and compute kgCO2e
app.post('/ledger', requireApiToken, async (req, res) => {
  try {
    const { user_id, type, amount, unit, meta, scope } = req.body || {};
    // Basic validation
    const allowedTypes = ['transport','electricity','food','purchase'];
    if (!type || typeof type !== 'string' || allowedTypes.indexOf(type) === -1) return res.status(400).json({ error: 'invalid_type', message: 'type must be one of ' + allowedTypes.join(',') });
    const amt = parseFloat(amount);
    if (Number.isNaN(amt) || !isFinite(amt) || amt < 0) return res.status(400).json({ error: 'invalid_amount', message: 'amount must be a non-negative number' });
    const metaObj = (typeof meta === 'string') ? (()=>{ try{return JSON.parse(meta)}catch(e){return {}} })() : (meta || {});
    // require a factor either specific or generic
    const factor = metaObj.gco2PerKm || metaObj.gco2PerKwh || metaObj.gco2PerKg || metaObj.gco2PerCurrencyUnit || metaObj.gco2PerUnit;
    if (factor == null || Number.isNaN(Number(factor))) return res.status(400).json({ error: 'missing_factor', message: 'meta must include numeric gco2Per... factor' });

    // normalize amount and meta
    const normalizedAmount = amt;
    const normalizedMeta = metaObj;

    // Compute kgCO2e using shared calculator
    const activity = { type, amount: normalizedAmount, unit, meta: normalizedMeta };
    const kgco2e = calc.calculateActivity(activity);

    const [result] = await pool.query('INSERT INTO ledger (user_id, type, amount, unit, meta, kgco2e, scope) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, type, normalizedAmount, unit || null, JSON.stringify(normalizedMeta || {}), kgco2e, scope || null]);

    const [rows] = await pool.query('SELECT * FROM ledger WHERE id = ?', [result.insertId]);
      const entry = rows[0];
      // Evaluate badges asynchronously (but wait so client can see awarded badges)
      const awarded = await badges.evaluateForEntry(entry);
      res.json(Object.assign({}, entry, { awarded_badges: awarded }));
  } catch (err) {
    console.error('ledger POST error', err);
    const payload = { error: 'db_error' };
    if (process.env.NODE_ENV !== 'production') payload.message = err.message;
    res.status(500).json(payload);
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
    console.error('ledger GET error', err);
    const payload = { error: 'db_error' };
    if (process.env.NODE_ENV !== 'production') payload.message = err.message;
    res.status(500).json(payload);
  }
});

// List badges for a user
app.get('/badges/:user_id', requireApiToken, async (req, res) => {
  try {
    const rows = await badges.listBadgesForUser(req.params.user_id);
    res.json(rows);
  } catch (err) {
    console.error('badges list error', err);
    const payload = { error: 'db_error' };
    if (process.env.NODE_ENV !== 'production') payload.message = err.message;
    res.status(500).json(payload);
  }
});

// Global error handlers (log extra info)
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('unhandledRejection', reason, p);
});

// Simple evaluation API used by frontend for an "评价表" demo
app.get('/evaluation', async (req, res) => {
  try {
    // sample evaluation rows — in future this could be DB-backed
    const data = [
      { id: 1, metric: '数据完整性', score: 88, comment: '账本字段齐全，因子可追溯' },
      { id: 2, metric: '可视化清晰度', score: 72, comment: '树木隐喻可读性良好，时间轴刻度需改进' },
      { id: 3, metric: '移动端适配', score: 60, comment: '初步响应，控件触控目标需增大' },
      { id: 4, metric: '因子来源可信度', score: 95, comment: '使用 DEFRA/Poore/OWID 作为优选' }
    ];
    res.json({ ok: true, rows: data });
  } catch (err) {
    console.error('evaluation error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// 添加认证路由
app.post('/register', register);
app.post('/login', login);

// Start server after DB init
const PORT = process.env.PORT || 3001;
console.log('Starting backend server on port', PORT);
console.log('Process ID:', process.pid);
console.log('Current directory:', process.cwd());

init().then(() => {
  console.log('Database initialized successfully');
  
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log('Backend listening on 127.0.0.1:', PORT);
    console.log('Server address:', server.address());
    
    // 测试服务器是否真正运行
    setTimeout(() => {
      const test = require('http');
      test.get(`http://127.0.0.1:${PORT}/health`, (res) => {
        console.log('Self-test successful, status:', res.statusCode);
      }).on('error', (err) => {
        console.log('Self-test failed:', err.message);
      });
    }, 1000);
  });
  
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
  
  // Handle process signals
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
}).catch(err => {
  console.error('Failed DB init', err);
  process.exit(1);
});
