#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

console.log('========================================');
console.log('   Task Manager Development Launcher');
console.log('========================================');
console.log('');

// Function to kill processes on specific ports
function killPort(port) {
    return new Promise((resolve) => {
        const isWindows = os.platform() === 'win32';
        
        if (isWindows) {
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (stdout) {
                    const lines = stdout.split('\n');
                    lines.forEach(line => {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length > 4) {
                            const pid = parts[parts.length - 1];
                            if (pid && !isNaN(pid)) {
                                exec(`taskkill /F /PID ${pid}`, () => {
                                    console.log(`✓ Killed process on port ${port}`);
                                    resolve();
                                });
                                return;
                            }
                        }
                    });
                }
                console.log(`✓ Port ${port} is free`);
                resolve();
            });
        } else {
            exec(`lsof -ti:${port}`, (error, stdout) => {
                if (stdout) {
                    const pid = stdout.trim();
                    exec(`kill -9 ${pid}`, () => {
                        console.log(`✓ Killed process on port ${port}`);
                        resolve();
                    });
                } else {
                    console.log(`✓ Port ${port} is free`);
                    resolve();
                }
            });
        }
    });
}

async function main() {
    // Clear ports
    console.log('Checking and clearing ports...');
    await killPort(8000);
    await killPort(3000);
    console.log('');
    
    const projectRoot = path.resolve(__dirname);
    const isWindows = os.platform() === 'win32';

    // Apply database migrations
    console.log('Applying database migrations...');
    const migratePath = isWindows
        ? path.join(projectRoot, 'backend', '.venv', 'Scripts', 'python.exe')
        : path.join(projectRoot, 'backend', '.venv', 'bin', 'python');
    await new Promise(resolve => {
        const migrate = spawn(migratePath, ['-m', 'alembic', 'upgrade', 'head'], {
            cwd: path.join(projectRoot, 'backend'),
            stdio: 'inherit',
            shell: false
        });
        migrate.on('close', resolve);
    });

    // Start Backend
    console.log('Starting Backend Server (Python/FastAPI)...');
    console.log('Backend will be available at: http://localhost:8000');
    console.log('API Documentation at: http://localhost:8000/docs');
    
    const backendPath = isWindows 
        ? path.join(projectRoot, 'backend', '.venv', 'Scripts', 'python.exe')
        : path.join(projectRoot, 'backend', '.venv', 'bin', 'python');
    
    const backendArgs = ['-m', 'uvicorn', 'backend.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];
    
    const backendProcess = spawn(backendPath, backendArgs, {
        cwd: projectRoot,
        stdio: 'inherit',
        detached: false
    });
    
    // Wait for backend to start
    console.log('Waiting 3 seconds for backend to initialize...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start Frontend
    console.log('Starting Frontend Server (Next.js)...');
    console.log('Frontend will be available at: http://localhost:3000');
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(projectRoot, 'frontend'),
        stdio: 'inherit',
        detached: false,
        shell: true
    });
    
    console.log('');
    console.log('========================================');
    console.log('           Servers Running');
    console.log('========================================');
    console.log('');
    console.log('Backend:  http://localhost:8000');
    console.log('Frontend: http://localhost:3000');
    console.log('API Docs: http://localhost:8000/docs');
    console.log('');
    console.log('Press Ctrl+C to stop both servers');
    console.log('');
    
    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log('\nShutting down servers...');
        backendProcess.kill();
        frontendProcess.kill();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        backendProcess.kill();
        frontendProcess.kill();
        process.exit(0);
    });
}

main().catch(console.error);
