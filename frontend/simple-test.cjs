#!/usr/bin/env node

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Task Manager Frontend Test Server',
    version: '1.0.0',
    path: req.url,
    method: req.method
  }));
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nSimple frontend test server running on http://localhost:${PORT}`);
  console.log('This is a placeholder until Next.js issues are resolved.');
  console.log('Press Ctrl+C to stop\n');
});