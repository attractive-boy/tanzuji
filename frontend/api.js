// Simple frontend API client. Attempts to call backend at `BACKEND_URL` or localhost:3001.
const BACKEND_URL = (typeof window !== 'undefined' && window.BACKEND_URL) || 'http://localhost:3001';

async function postLedger(entry) {
  try {
    const res = await fetch(`${BACKEND_URL}/ledger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!res.ok) throw new Error('network');
    return await res.json();
  } catch (err) {
    console.warn('postLedger failed', err);
    throw err;
  }
}

async function fetchLedger(limit = 50, offset = 0) {
  try {
    const res = await fetch(`${BACKEND_URL}/ledger?limit=${limit}&offset=${offset}`);
    if (!res.ok) throw new Error('network');
    return await res.json();
  } catch (err) {
    console.warn('fetchLedger failed', err);
    return null;
  }
}

if (typeof window !== 'undefined') window.apiClient = { postLedger, fetchLedger };

module.exports = { postLedger, fetchLedger };
