const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

function requireApiToken(req, res, next) {
  // If no API_TOKEN is configured, skip auth for development
  if (!process.env.API_TOKEN) return next();

  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'missing_auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid_auth' });
  const token = parts[1];
  if (token !== process.env.API_TOKEN) return res.status(403).json({ error: 'forbidden' });
  next();
}

module.exports = { requireApiToken };
