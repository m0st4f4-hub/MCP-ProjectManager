import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import path from 'path'

const repoRoot = path.resolve(__dirname, '../../../..')
const script = path.join(repoRoot, 'validate_frontend.js')
const mock = path.join(__dirname, 'mock-missing-files.cjs')

describe('validate_frontend.js', () => {
  it('should report success for current project', () => {
    const result = spawnSync('node', [script], { cwd: repoRoot, encoding: 'utf8' })
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('Validation Summary')
    expect(result.stdout).toMatch(/Frontend integration is (EXCELLENT|GOOD)/)
  })

  it('should fail when required files are missing', () => {
    const result = spawnSync('node', ['-r', mock, script], { cwd: repoRoot, encoding: 'utf8' })
    expect(result.status).not.toBe(0)
    expect(result.stdout).toContain('Frontend integration needs IMPROVEMENT')
  })
})
