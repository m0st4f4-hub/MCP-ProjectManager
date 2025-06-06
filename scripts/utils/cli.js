#!/usr/bin/env node

const { spawnSync } = require('child_process');
const os = require('os');
const { Command } = require('commander');
const { spawn } = require('child_process');
const path = require('path');

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Node.js 18 or higher is required. Current version: ${process.version}`);
  process.exit(1);
}

// Try to load package.json from project root
let pkg;
try {
  pkg = require('../../package.json');
} catch (e) {
  pkg = { version: '1.0.0' };
}

const program = new Command();
program
  .name('mcp-project-manager')
  .description('CLI for MCP Project Manager')
  .version(pkg.version);

program
  .command('dev')
  .description('Launch backend and frontend in development mode')
  .action(() => {
    require('../dev/dev_launcher.js');
  });

program
  .command('migrate')
  .description('Run database migrations using Alembic')
  .action(() => {
    const proc = spawn('alembic', ['upgrade', 'head'], {
      cwd: path.join(__dirname, '../../backend'),
      stdio: 'inherit',
      shell: true,
    });
    proc.on('exit', code => process.exit(code));
  });

const args = process.argv.slice(2);

if (args[0] === 'setup') {
  const script = os.platform() === 'win32' ? 'init_backend.ps1' : 'init_backend.sh';
  const cmd = os.platform() === 'win32' ? 'powershell' : 'bash';
  const result = spawnSync(cmd, [path.join(__dirname, '../../', script)], { stdio: 'inherit' });
  process.exit(result.status);
}

if (args.length === 0) {
  require('../dev/dev_launcher.js');
} else {
  program.parse(process.argv);
}

