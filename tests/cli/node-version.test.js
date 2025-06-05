const test = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cliPath = path.resolve('cli.js');

test('cli exits with error when Node version is below 18', () => {
  const script = `Object.defineProperty(process.versions,'node',{value:'16.0.0'});require('${cliPath.replace(/\\/g, '\\\\')}');`;
  const result = spawnSync(process.execPath, ['-e', script], {
    encoding: 'utf8',
  });
  assert.strictEqual(result.status, 1, 'expected exit code 1');
  assert.match(result.stderr, /Node\.js 18 or higher is required/);
});
