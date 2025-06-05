import { describe, it, expect } from 'vitest'
import execa from 'execa'
import path from 'path'

const repoRoot = path.resolve(__dirname, '..', '..')
const frontendDir = path.join(repoRoot, 'frontend')

describe('TypeScript type checking', () => {
  it('runs tsc --noEmit without errors', async () => {
    const result = await execa('npx', ['tsc', '--noEmit'], { cwd: frontendDir })
    expect(result.exitCode).toBe(0)
  })
})
