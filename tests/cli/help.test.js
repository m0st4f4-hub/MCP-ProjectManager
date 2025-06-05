const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.resolve('cli.js');

test('cli.js --help displays help information', () => {
  const result = spawnSync('node', [cliPath, '--help'], { encoding: 'utf8' });
  assert.strictEqual(result.status, 0, 'expected exit code 0');
  assert.ok(result.stdout.length > 0, 'stdout should not be empty');
});
