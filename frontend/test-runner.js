const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

(function() {
  Help() {
    console.log('Available test commands:')
    console.log('')
    Object.entries(TEST_TYPES).forEach(([key, description]) => {
      console.log(`  npm run test-runner ${key.padEnd(12)} - ${description}`)
    })
    console.log('')
    console.log('Examples:')
    console.log('  npm run test-runner unit        - Run only unit tests')
    console.log('  npm run test-runner e2e          - Run only E2E tests')
    console.log('  npm run test-runner all          - Run complete test suite')
    console.log('  npm run test-runner coverage     - Generate coverage report')
    console.log('')
  }

  function runCommand(command, args = [], options = {}) {
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

  async function runUnitTests() {
    console.log('🧪 Running Unit Tests...')
    try {
      await runCommand('npm', ['run', 'test:run'])
      console.log('✅ Unit tests completed successfully')
      return true
    } catch (error) {
      console.log('❌ Unit tests failed')
      return false
    }
  }

  async function runIntegrationTests() {
    console.log('🔗 Running Integration Tests...')
    try {
      await runCommand('npm', ['run', 'test:run', '--', 'src/__tests__/integration'])
      console.log('✅ Integration tests completed successfully')
      return true
    } catch (error) {
      console.log('❌ Integration tests failed')
      return false
    }
  }

  async function runE2ETests() {
    console.log('🌐 Running End-to-End Tests...')
    try {
      await runCommand('npx', ['playwright', 'test', '--project=chromium'])
      console.log('✅ E2E tests completed successfully')
      return true
    } catch (error) {
      console.log('❌ E2E tests failed')
      return false
    }
  }

  async function runAPITests() {
    console.log('🔌 Running API Tests...')
    try {
      await runCommand('npx', ['playwright', 'test', '--project="API Tests"'])
      console.log('✅ API tests completed successfully')
      return true
    } catch (error) {
      console.log('❌ API tests failed')
      return false
    }
  }

  async function generateCoverageReport() {
    console.log('📊 Generating Coverage Report...')
    try {
      await runCommand('npm', ['run', 'test:coverage'])
      
      // Check if coverage directory exists
      const coverageDir = path.join(process.cwd(), 'coverage')
      if (fs.existsSync(coverageDir)) {
        console.log(`📄 Coverage report generated in: ${coverageDir}`)
        console.log('📄 Open coverage/index.html in your browser to view the report')
      }
      
      console.log('✅ Coverage report generated successfully')
      return true
    } catch (error) {
      console.log('❌ Coverage report generation failed')
      return false
    }
  }

  async function checkPrerequisites() {
    console.log('🔍 Checking prerequisites...')
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      console.log('❌ node_modules not found. Run npm install first.')
      return false
    }
    
    // Check if backend is running
    try {
      await new Promise((resolve, reject) => {
        exec('curl -f http://localhost:8000/health || echo "Backend not running"', (error, stdout, stderr) => {
          if (stdout.includes('Backend not running')) {
            console.log('⚠️  Backend not running. Some tests may fail.')
            console.log('   Start backend with: python ../run_backend.py')
          } else {
            console.log('✅ Backend is running')
          }
          resolve(true)
        })
      })
    } catch (error) {
      console.log('⚠️  Could not check backend status')
    }
    
    return true
  }

  async function runAllTests() {
    console.log('🚀 Running Complete Test Suite...')
    console.log('')
    
    const results = {
      unit: false,
      integration: false,
      e2e: false,
      api: false,
      coverage: false
    }
    
    const startTime = Date.now()
    
    try {
      // Run tests in sequence to avoid conflicts
      results.unit = await runUnitTests()
      console.log('')
      
      results.integration = await runIntegrationTests()
      console.log('')
      
      results.e2e = await runE2ETests()
      console.log('')
      
      results.api = await runAPITests()
      console.log('')
      
      results.coverage = await generateCoverageReport()
      console.log('')
      
    } catch (error) {
      console.log(`❌ Test suite interrupted: ${error.message}`)
    }
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    // Display summary
    console.log('========================================')
    console.log('           TEST SUITE SUMMARY')
    console.log('========================================')
    console.log('')
    console.log(`Total Duration: ${duration}s`)
    console.log('')
    
    Object.entries(results).forEach(([testType, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED'
      console.log(`${testType.toUpperCase().padEnd(12)} ${status}`)
    })
    
    console.log('')
    
    const totalTests = Object.keys(results).length
    const passedTests = Object.values(results).filter(Boolean).length
    const overallSuccess = passedTests === totalTests
    
    if (overallSuccess) {
      console.log('🎉 ALL TESTS PASSED - SYSTEM READY FOR DEPLOYMENT')
    } else {
      console.log(`⚠️  ${totalTests - passedTests} TEST SUITE(S) FAILED`)
      console.log('🔧 Review failed tests before deployment')
    }
    
    console.log('')
    
    return overallSuccess
  }

  async function main() {
    const testType = process.argv[2] || 'help'
    
    if (testType === 'help' || !TEST_TYPES[testType]) {
      displayHelp()
      return
    }
    
    console.log(`🎯 Target: ${TEST_TYPES[testType]}`)
    console.log('')
    
    // Check prerequisites
    const prereqsPassed = await checkPrerequisites()
    if (!prereqsPassed) {
      process.exit(1)
    }
    
    console.log('')
    
    let success = false
    
    try {
      switch (testType) {
        case 'unit':
          success = await runUnitTests()
          break
        case 'integration':
          success = await runIntegrationTests()
          break
        case 'e2e':
          success = await runE2ETests()
          break
        case 'api':
          success = await runAPITests()
          break
        case 'coverage':
          success = await generateCoverageReport()
          break
        case 'all':
          success = await runAllTests()
          break
        default:
          console.log(`❌ Unknown test type: ${testType}`)
          displayHelp()
          process.exit(1)
      }
    } catch (error) {
      console.log(`❌ Test execution failed: ${error.message}`)
      success = false
    }
    
    console.log('')
    console.log('========================================')
    
    if (success) {
      console.log('🎉 TEST EXECUTION COMPLETED SUCCESSFULLY')
      process.exit(0)
    } else {
      console.log('❌ TEST EXECUTION FAILED')
      process.exit(1)
    }
  }

  // Handle process interruption
  process.on('SIGINT', () => {
    console.log('\n🛑 Test execution interrupted by user')
    process.exit(1)
  })

  process.on('SIGTERM', () => {
    console.log('\n🛑 Test execution terminated')
    process.exit(1)
  })

  if (require.main === module) {
    main().catch(error => {
      console.error('💥 Unexpected error:', error)
      process.exit(1)
    })
  }

  module.exports = {
    runUnitTests,
    runIntegrationTests,
    runE2ETests,
    runAPITests,
    generateCoverageReport,
    runAllTests
  }

})();
