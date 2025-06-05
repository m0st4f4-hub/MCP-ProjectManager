#!/usr/bin/env node

const { spawnSync } = require('child_process');
const os = require('os');

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Node.js 18 or higher is required. Current version: ${process.version}`);
  process.exit(1);
}

const args = process.argv.slice(2);

if (args[0] === 'setup') {
  const script = os.platform() === 'win32' ? 'init_backend.ps1' : 'init_backend.sh';
  const cmd = os.platform() === 'win32' ? 'powershell' : 'bash';
  const result = spawnSync(cmd, [script], { stdio: 'inherit' });
  process.exit(result.status);
}

require('./dev_launcher.js');

