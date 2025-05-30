#!/usr/bin/env node
/**
 * Frontend Component Integration Validator
 * Validates that all frontend components can properly integrate with the backend APIs
 */

const fs = require('fs');
const path = require('path');

class FrontendComponentValidator {
    constructor() {
        this.frontendDir = path.join(__dirname, 'frontend', 'src');
        this.results = [];
    }

    validateApiServiceIntegration() {
        console.log('🔍 Validating API Service Integration...');
        
        const apiDir = path.join(this.frontendDir, 'services', 'api');
        
        if (!fs.existsSync(apiDir)) {
            console.log('  ❌ API services directory not found');
            this.results.push(['API Service Files', false, 'Directory not found']);
            return false;
        }
        
        const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));
        
        const requiredApiFiles = [
            'config.ts',
            'request.ts', 
            'projects.ts',
            'tasks.ts',
            'agents.ts',
            'memory.ts',
            'rules.ts'
        ];
        
        let allPresent = true;
        for (const required of requiredApiFiles) {
            if (apiFiles.includes(required)) {
                console.log(`  ✅ ${required} - Present`);
            } else {
                console.log(`  ❌ ${required} - Missing`);
                allPresent = false;
            }
        }
        
        this.results.push(['API Service Files', allPresent, `${apiFiles.length} files found`]);
        return allPresent;
    }

    validateTypeDefinitions() {
        console.log('\n🔍 Validating Type Definitions...');
        
        const typesDir = path.join(this.frontendDir, 'types');
        
        if (!fs.existsSync(typesDir)) {
            console.log('  ❌ Types directory not found');
            this.results.push(['Type Definition Files', false, 'Directory not found']);
            return false;
        }
        
        const typeFiles = fs.readdirSync(typesDir).filter(f => f.endsWith('.ts'));
        
        const requiredTypes = [
            'index.ts',
            'project.ts',
            'task.ts',
            'agent.ts'
        ];
        
        let allPresent = true;
        for (const required of requiredTypes) {
            if (typeFiles.includes(required)) {
                console.log(`  ✅ ${required} - Present`);
            } else {
                console.log(`  ❌ ${required} - Missing`);
                allPresent = false;
            }
        }
        
        this.results.push(['Type Definition Files', allPresent, `${typeFiles.length} files found`]);
        return allPresent;
    }

    validateEnvironmentConfig() {
        console.log('\n🔍 Validating Environment Configuration...');
        
        const envFile = path.join(__dirname, 'frontend', '.env.local');
        let configValid = true;
        
        try {
            if (fs.existsSync(envFile)) {
                const envContent = fs.readFileSync(envFile, 'utf8');
                
                if (envContent.includes('NEXT_PUBLIC_API_BASE_URL')) {
                    console.log('  ✅ API base URL configured');
                    
                    // Check if it points to the correct backend
                    if (envContent.includes('localhost:8000')) {
                        console.log('  ✅ Points to correct backend port');
                    } else {
                        console.log('  ⚠️  Backend port may need verification');
                    }
                } else {
                    console.log('  ❌ API base URL not configured');
                    configValid = false;
                }
            } else {
                console.log('  ❌ .env.local file not found');
                configValid = false;
            }
        } catch (error) {
            console.log(`  ❌ Error reading environment config: ${error.message}`);
            configValid = false;
        }
        
        this.results.push(['Environment Config', configValid, 'Environment configuration checked']);
        return configValid;
    }

    validatePackageJson() {
        console.log('\n🔍 Validating Package Configuration...');
        
        const packageFile = path.join(__dirname, 'frontend', 'package.json');
        let packageValid = true;
        
        try {
            if (fs.existsSync(packageFile)) {
                const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
                
                const requiredDeps = [
                    'next',
                    'react',
                    'react-dom',
                    'typescript',
                    '@chakra-ui/react'
                ];
                
                let missingDeps = [];
                for (const dep of requiredDeps) {
                    if (packageContent.dependencies && packageContent.dependencies[dep]) {
                        console.log(`  ✅ ${dep} - Present`);
                    } else if (packageContent.devDependencies && packageContent.devDependencies[dep]) {
                        console.log(`  ✅ ${dep} - Present (dev)`);
                    } else {
                        console.log(`  ❌ ${dep} - Missing`);
                        missingDeps.push(dep);
                        packageValid = false;
                    }
                }
                
                if (missingDeps.length === 0) {
                    console.log('  ✅ All required dependencies present');
                }
            } else {
                console.log('  ❌ package.json not found');
                packageValid = false;
            }
        } catch (error) {
            console.log(`  ❌ Error reading package.json: ${error.message}`);
            packageValid = false;
        }
        
        this.results.push(['Package Configuration', packageValid, 'Package dependencies checked']);
        return packageValid;
    }

    async runValidation() {
        console.log('🎨 Frontend Component Integration Validation');
        console.log('='.repeat(50));
        
        // Run all validations
        const validations = [
            this.validateApiServiceIntegration.bind(this),
            this.validateTypeDefinitions.bind(this),
            this.validateEnvironmentConfig.bind(this),
            this.validatePackageJson.bind(this)
        ];
        
        let totalPassed = 0;
        let totalTests = 0;
        
        for (const validation of validations) {
            const result = validation();
            totalTests++;
            if (result) totalPassed++;
        }
        
        // Summary
        console.log('\n📊 Validation Summary');
        console.log('-'.repeat(30));
        
        for (const [test, passed, details] of this.results) {
            const status = passed ? '✅' : '❌';
            console.log(`${status} ${test}: ${details}`);
        }
        
        const successRate = (totalPassed / totalTests * 100);
        console.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
        
        if (successRate >= 80) {
            console.log('🎉 Frontend integration is EXCELLENT!');
            return true;
        } else if (successRate >= 60) {
            console.log('✅ Frontend integration is GOOD - minor issues detected');
            return true;
        } else {
            console.log('⚠️  Frontend integration needs IMPROVEMENT');
            return false;
        }
    }
}

async function main() {
    const validator = new FrontendComponentValidator();
    const success = await validator.runValidation();
    
    if (!success) {
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { FrontendComponentValidator };
