#!/usr/bin/env node

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Node.js 18 or higher is required. Current version: ${process.version}`);
  process.exit(1);
}

const { Command } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const pkg = require('./package.json');

const program = new Command();
program
  .name('mcp-project-manager')
  .description('CLI for MCP Project Manager')
  .version(pkg.version);

program
  .command('dev')
  .description('Launch backend and frontend in development mode')
  .action(() => {
    require('./dev_launcher.js');
  });

program
  .command('migrate')
  .description('Run database migrations using Alembic')
  .action(() => {
    const proc = spawn('alembic', ['upgrade', 'head'], {
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit',
      shell: true,
    });
    proc.on('exit', code => process.exit(code));
  });

const args = process.argv.slice(2);
if (args.length === 0) {
  require('./dev_launcher.js');
} else {
  program.parse(process.argv);
}

