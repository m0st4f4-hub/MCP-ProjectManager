#!/usr/bin/env node

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Node.js 18 or higher is required. Current version: ${process.version}`);
  process.exit(1);
}

require('./dev_launcher.js');

