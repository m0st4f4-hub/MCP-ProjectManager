const fs = require('fs');
const path = require('path');

// Simple build script for React app without Next.js
console.log('Building simple React app...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy HTML file
fs.copyFileSync(
  path.join(__dirname, 'public', 'index.html'),
  path.join(distDir, 'index.html')
);

console.log('Simple build complete. Use a TypeScript compiler for the React app.');
console.log('Or serve directly with a development server.');