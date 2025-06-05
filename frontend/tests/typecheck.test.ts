import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import path from 'path'

const repoRoot = path.resolve(__dirname, '..', '..')
const frontendDir = path.join(repoRoot, 'frontend')

describe('TypeScript type checking', () => {
  it('runs tsc --noEmit without errors', () => {
    const result = spawnSync('npx', ['tsc', '--noEmit'], {
      cwd: frontendDir,
      encoding: 'utf8',
      shell: true,
    })
    expect(result.status).toBe(0)
  })
})
