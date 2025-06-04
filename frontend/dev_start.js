#!/usr/bin/env node
/**
 * Frontend Development Setup Script
 * This script handles the complete setup and startup of the Task Manager frontend.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(cmd, description, options = {}) {
    console.log(`🔧 ${description}...`);
    try {
        const result = execSync(cmd, { 
            stdio: 'pipe', 
            encoding: 'utf8',
            cwd: __dirname,
            ...options 
        });
        console.log(`✅ ${description} completed successfully`);
        if (result.trim()) {
            console.log(`   Output: ${result.trim()}`);
        }
        return true;
    } catch (error) {
        console.log(`❌ ${description} failed`);
        if (error.stderr) {
            console.log(`   Error: ${error.stderr.trim()}`);
        }
        return false;
    }
}

function checkNodeEnvironment() {
    console.log('🔍 Checking Node.js environment...');
    
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        
        console.log(`✅ Node.js ${nodeVersion} detected`);
        console.log(`✅ npm ${npmVersion} detected`);
        
        // Check if package.json exists
        if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
            console.log('❌ package.json not found');
            return false;
        }
        
        console.log('✅ package.json found');
        return true;
        
    } catch (error) {
        console.log('❌ Node.js or npm not found');
        return false;
    }
}

function installDependencies() {
    console.log('📦 Installing dependencies...');
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        console.log('✅ node_modules already exists');
        return true;
    }
    
    return runCommand('npm install', 'Installing npm dependencies', { timeout: 300000 });
}

async function checkBackendConnection() {
    console.log('🔗 Checking backend connection...');
    
    // Read environment configuration
    const envPath = path.join(__dirname, '.env.local');
    let backendUrl = 'http://localhost:8000';
    
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/NEXT_PUBLIC_API_BASE_URL=(.+)/);
        if (match) {
            backendUrl = match[1].trim();
        }
    }
    
    console.log(`🔍 Checking backend at: ${backendUrl}`);

    try {
        const response = await fetch(`${backendUrl}/health`);
        if (!response.ok) {
            console.log(`❌ Backend health check failed with status ${response.status}`);
            return false;
        }
        console.log('✅ Backend is reachable');
        return true;
    } catch (error) {
        console.log(`❌ Failed to reach backend: ${error.message || error}`);
        return false;
    }
}

function startDevelopmentServer() {
    console.log('🚀 Starting Next.js development server...');
    
    console.log('🌐 Frontend server starting on http://localhost:3000');
    console.log('📱 The application will automatically open in your browser');
    console.log('\n⚡ Server is starting... (Press Ctrl+C to stop)');
    
    try {
        // Start the development server
        const child = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            cwd: __dirname,
            shell: true
        });
        
        child.on('error', (error) => {
            console.log(`❌ Server error: ${error}`);
        });
        
        child.on('close', (code) => {
            console.log(`\n🛑 Server stopped with code ${code}`);
        });
        
    } catch (error) {
        console.log(`❌ Failed to start server: ${error}`);
    }
}

async function main() {
    console.log('🎨 Task Manager Frontend Development Setup');
    console.log('='.repeat(50));
    
    // Check Node.js environment
    if (!checkNodeEnvironment()) {
        console.log('❌ Environment check failed');
        process.exit(1);
    }
    
    // Install dependencies
    if (!installDependencies()) {
        console.log('❌ Dependency installation failed');
        process.exit(1);
    }
    
    // Check backend connection
    if (!(await checkBackendConnection())) {
        console.log('⚠️  Backend connection issues detected');
    }
    
    // Start development server
    startDevelopmentServer();
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = { runCommand, checkNodeEnvironment, installDependencies };
