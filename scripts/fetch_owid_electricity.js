const fs = require('fs');
const path = require('path');
const https = require('https');

// Fetch OWID electricity intensity CSV for countries (example URL expected)
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Bad status ' + res.statusCode));
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', d => raw += d);
      res.on('end', () => resolve(raw));
    }).on('error', reject);
  });
}

async function run() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node fetch_owid_electricity.js <csv_url>');
    process.exit(2);
  }
  try {
    const csv = await fetchUrl(url);
    const out = path.join(__dirname, '../data/owid_electricity.csv');
    fs.writeFileSync(out, csv, 'utf8');
    console.log('Saved to', out);
  } catch (err) {
    console.error('Fetch failed', err);
    process.exit(2);
  }
}

if (require.main === module) run();
