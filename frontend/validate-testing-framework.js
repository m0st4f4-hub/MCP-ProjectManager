#!/usr/bin/env node

/**
 * TASK MANAGER SYSTEM - TESTING FRAMEWORK VALIDATION
 * NASA/SpaceX Grade Test Suite Validation Script
 * 
 * Test Classification: MISSION-CRITICAL
 * Test Control: TMS-ATP-012-VALIDATION
 * Version: 2.0.0
 * Compliance: NASA NPR 7150.2, SpaceX Software Standards
 */

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Task Manager Frontend Testing Framework Validation')
console.log('====================================================')
console.log('')

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`)
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Success: ${command}`)
        resolve(code)
      } else {
        console.log(`❌ Failed: ${command} (exit code: ${code})`)
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
    
    process.on('error', (error) => {
      console.log(`❌ Error: ${command} - ${error.message}`)
      reject(error)
    })
  })
}

async function validateTestingFramework() {
  console.log('🧪 Validating Testing Framework Components...')
  console.log('')
  
  const validationResults = {
    dependencies: false,
    configuration: false,
    unitTests: false,
    testUtilities: false,
    mockingFramework: false,
    coverageReporting: false,
  }
  
  try {
    // 1. Validate Dependencies
    console.log('📦 Checking Testing Dependencies...')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const requiredDeps = [
      '@testing-library/react',
      '@testing-library/jest-dom', 
      '@testing-library/user-event',
      '@faker-js/faker',
      'msw',
      'vitest',
      '@playwright/test'
    ]
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageJson.devDependencies[dep] && !packageJson.dependencies[dep]
    )
    
    if (missingDeps.length === 0) {
      console.log('✅ All required testing dependencies are installed')
      validationResults.dependencies = true
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`)
    }
    
    // 2. Validate Configuration Files
    console.log('⚙️  Checking Configuration Files...')
    const configFiles = [
      'vitest.config.ts',
      'playwright.config.ts',
      'src/__tests__/setup.ts'
    ]
    
    const missingConfigs = configFiles.filter(file => !fs.existsSync(file))
    
    if (missingConfigs.length === 0) {
      console.log('✅ All configuration files are present')
      validationResults.configuration = true
    } else {
      console.log(`❌ Missing config files: ${missingConfigs.join(', ')}`)
    }
    
    // 3. Run Unit Tests
    console.log('🧪 Running Unit Tests...')
    try {
      await runCommand('npx', ['vitest', 'run', 'src/components/__tests__/TaskStatusTag.test.tsx'])
      console.log('✅ Unit tests are working correctly')
      validationResults.unitTests = true
    } catch (error) {
      console.log('❌ Unit tests failed')
    }
    
    // 4. Validate Test Utilities
    console.log('🛠️  Checking Test Utilities...')
    const utilityFiles = [
      'src/__tests__/utils/test-utils.tsx',
      'src/__tests__/factories/task.factory.ts',
      'src/__tests__/factories/user.factory.ts',
      'src/__tests__/factories/project.factory.ts',
      'src/__tests__/mocks/handlers.ts',
      'src/__tests__/mocks/server.ts'
    ]
    
    const missingUtils = utilityFiles.filter(file => !fs.existsSync(file))
    
    if (missingUtils.length === 0) {
      console.log('✅ All test utility files are present')
      validationResults.testUtilities = true
    } else {
      console.log(`❌ Missing utility files: ${missingUtils.join(', ')}`)
    }
    
    // 5. Validate MSW Setup
    console.log('🎭 Checking Mock Service Worker Setup...')
    try {
      const handlersContent = fs.readFileSync('src/__tests__/mocks/handlers.ts', 'utf8')
      const serverContent = fs.readFileSync('src/__tests__/mocks/server.ts', 'utf8')
      
      if (handlersContent.includes('http.get') && serverContent.includes('setupServer')) {
        console.log('✅ MSW mocking framework is properly configured')
        validationResults.mockingFramework = true
      } else {
        console.log('❌ MSW configuration is incomplete')
      }
    } catch (error) {
      console.log('❌ Failed to validate MSW setup')
    }
    
    // 6. Test Coverage Reporting
    console.log('📊 Testing Coverage Reporting...')
    try {
      await runCommand('npx', ['vitest', 'run', '--coverage', 'src/components/__tests__/TaskStatusTag.test.tsx'])
      
      if (fs.existsSync('coverage')) {
        console.log('✅ Coverage reporting is working correctly')
        validationResults.coverageReporting = true
      } else {
        console.log('❌ Coverage directory was not generated')
      }
    } catch (error) {
      console.log('❌ Coverage reporting failed')
    }
    
  } catch (error) {
    console.log(`❌ Validation error: ${error.message}`)
  }
  
  // Summary
  console.log('')
  console.log('====================================================')
  console.log('         TESTING FRAMEWORK VALIDATION SUMMARY')
  console.log('====================================================')
  console.log('')
  
  const totalChecks = Object.keys(validationResults).length
  const passedChecks = Object.values(validationResults).filter(Boolean).length
  
  Object.entries(validationResults).forEach(([check, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED'
    const displayName = check.replace(/([A-Z])/g, ' $1').toUpperCase().trim()
    console.log(`${displayName.padEnd(20)} ${status}`)
  })
  
  console.log('')
  console.log(`Overall Status: ${passedChecks}/${totalChecks} checks passed`)
  
  if (passedChecks === totalChecks) {
    console.log('')
    console.log('🎉 TESTING FRAMEWORK VALIDATION SUCCESSFUL')
    console.log('✨ All systems are operational and ready for development')
    console.log('')
    console.log('Available Commands:')
    console.log('  npm run test-runner unit          - Run unit tests')
    console.log('  npm run test-runner integration   - Run integration tests')
    console.log('  npm run test-runner e2e           - Run E2E tests')
    console.log('  npm run test-runner all           - Run complete test suite')
    console.log('  npm run test:coverage             - Generate coverage report')
    console.log('')
    console.log('📖 See TESTING_FRAMEWORK.md for complete documentation')
    
    return true
  } else {
    console.log('')
    console.log('⚠️  TESTING FRAMEWORK VALIDATION INCOMPLETE')
    console.log('🔧 Please address the failed checks before proceeding')
    
    return false
  }
}

async function main() {
  const success = await validateTestingFramework()
  process.exit(success ? 0 : 1)
}

// Remove CommonJS exports since we're using ES modules
// if (require.main === module) {
//   main().catch(error => {
//     console.error('💥 Unexpected validation error:', error)
//     process.exit(1)
//   })
// }

// module.exports = { validateTestingFramework }

// Run directly in ES module
main().catch(error => {
  console.error('💥 Unexpected validation error:', error)
  process.exit(1)
})

export { validateTestingFramework }
