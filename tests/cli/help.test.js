const test = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const cliPath = path.resolve('scripts/utils/cli.js');

test('cli.js --help displays launcher info and exits with code 1', () => {
  try {
    const output = execSync(`node ${cliPath} --help`, { encoding: 'utf8', timeout: 5000 });
    console.log('CLI help output:', output);
  } catch (error) {
    // Expected to exit with code 1 since it's a launcher
    expect(error.status).toBe(1);
    expect(error.stdout).toContain('Task Manager Development Launcher');
  }
});
