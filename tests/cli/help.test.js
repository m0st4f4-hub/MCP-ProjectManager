const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.resolve('cli.js');

test('cli.js --help displays launcher info and exits with code 1', () => {
  const result = spawnSync('node', [cliPath, '--help'], { encoding: 'utf8' });
<<<<<<< HEAD
  assert.strictEqual(result.status, 0, 'expected exit code 0');
  assert.ok(result.stdout.length > 0, 'stdout should not be empty');
  assert.ok(result.stdout.includes('migrate'), 'help should mention migrate command');
=======
  assert.strictEqual(result.status, 1, 'expected exit code 1');
  assert.match(result.stdout, /Task Manager Development Launcher/);
>>>>>>> origin/codex/add-cli-command-tests-and-ci-integration
});
