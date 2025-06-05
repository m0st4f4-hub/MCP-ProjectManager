#!/usr/bin/env node

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(
    `Node.js 18 or higher is required. Current version: ${process.version}`
  );
  process.exit(1);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`Usage: mcp-project-manager [options]

Starts the development environment.

Options:
  --help, -h   Show this help message`);
  process.exit(0);
}

require('./dev_launcher.js');
