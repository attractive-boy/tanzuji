const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello World', timestamp: new Date().toISOString() }));
});

const PORT = 3005;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Simple server running on http://127.0.0.1:${PORT}`);
});