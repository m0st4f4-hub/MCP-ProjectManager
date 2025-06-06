const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.resolve('cli.js');

test('cli.js start prints launcher info and exits with code 1', () => {
  const result = spawnSync('node', [cliPath], { encoding: 'utf8' });
  assert.strictEqual(result.status, 1, 'expected exit code 1');
  assert.match(result.stdout, /Task Manager Development Launcher/);
});
