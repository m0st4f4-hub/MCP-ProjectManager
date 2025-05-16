#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { spawn, execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
let detect = require('detect-port');
if (detect && typeof detect !== 'function' && detect.default) {
  detect = detect.default;
}

// --- CONSTANTS ---
const packageRootPath = __dirname; 
const backendPath = path.join(packageRootPath, 'backend');
const frontendPath = path.join(packageRootPath, 'frontend');

// --- UTILITY FUNCTIONS ---
// Utility function to run commands with spinner
async function runWithSpinner(command, args, options, spinnerText) {
  const spinner = ora(spinnerText).start();
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);
    
    let stdout = '';
    let stderr = '';

    if (process.stdout) {
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }
    if (process.stderr) {
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }
    
    process.on('error', (error) => {
      spinner.fail(chalk.red(`Failed: ${error.message}`));
      reject(error);
    });

    process.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green(`${spinnerText} completed successfully`));
        resolve({ stdout, stderr });
      } else {
        spinner.fail(chalk.red(`${spinnerText} failed with code ${code}. Stderr: ${stderr}`));
        reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}. Stdout: ${stdout}`));
      }
    });
  });
}

// Function to check if Python is installed
function checkPython() {
  try {
    execSync('python --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to check if Node.js is installed
function checkNode() {
  try {
    execSync('node --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// --- CORE FUNCTIONS (Placeholders - To be implemented in subsequent tasks) ---
async function installBackendDependencies() {
  const requirementsPath = path.join(backendPath, 'requirements.txt');
  if (!fs.existsSync(requirementsPath)) {
    console.warn(chalk.yellow(`⚠️ requirements.txt not found at ${requirementsPath}. Skipping backend dependency installation.`));
    return Promise.resolve();
  }
  console.log(chalk.blue(`Installing backend dependencies from ${requirementsPath}...`));
  // Assuming 'python' is in PATH and will use the appropriate pip
  // Using --no-cache-dir to avoid potential permission issues in global/user installs
  try {
    await runWithSpinner('python', ['-m', 'pip', 'install', '--no-cache-dir', '-r', requirementsPath], { cwd: backendPath, shell: process.platform === 'win32' }, 'Installing backend dependencies');
    console.log(chalk.green('✅ Backend dependencies installed successfully.'));
  } catch (error) {
    console.error(chalk.red('❌ Error installing backend dependencies:'), error.message);
    console.warn(chalk.yellow('Please ensure Python and pip are correctly configured and try installing dependencies manually in the backend folder if issues persist.'));
    throw error; // Re-throw to stop the process if critical
  }
}

async function installFrontendDependenciesAndBuild() {
  const packageJsonPath = path.join(frontendPath, 'package.json');
  const packageLockPath = path.join(frontendPath, 'package-lock.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(chalk.yellow(`⚠️ package.json not found at ${packageJsonPath}. Skipping frontend dependency installation and build.`));
    return Promise.resolve();
  }
  if (!fs.existsSync(packageLockPath)) {
    console.warn(chalk.yellow(`⚠️ package-lock.json not found at ${packageLockPath}. Cannot use npm ci. Skipping frontend dependency installation and build.`));
    // Fallback or error, for now, we'll skip and let build fail if deps are missing.
    // Ideally, if bundling source, a lockfile should always be present.
    return Promise.resolve(); 
  }

  console.log(chalk.blue(`Installing frontend dependencies using npm ci from ${packageLockPath}...`));
  try {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    // npm ci deletes node_modules before installing, which is good for a clean state.
    await runWithSpinner(npmCmd, ['ci'], { cwd: frontendPath, shell: true }, 'Installing frontend dependencies (npm ci)');
    console.log(chalk.green('✅ Frontend dependencies installed successfully using npm ci.'));
  } catch (error) {
    console.error(chalk.red('❌ Error installing frontend dependencies with npm ci:'), error.message);
    console.warn(chalk.yellow('npm ci failed. This usually means package-lock.json is out of sync with package.json or missing. Please ensure a valid package-lock.json is included in the frontend directory of the package.'));
    throw error; 
  }

  // The SWC patching message might still appear if 'npm ci' doesn't handle it implicitly.
  // If SWC issues persist, we might need a targeted fix post-'npm ci' or ensure SWC deps are explicit in frontend/package.json

  console.log(chalk.blue('Building frontend application...'));
  try {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    // Attempt to set NODE_PATH to help with alias resolution
    const buildOptions = {
      cwd: frontendPath,
      shell: true,
      env: { ...process.env, NODE_PATH: './src' } // Set NODE_PATH relative to CWD (frontendPath)
    };
    await runWithSpinner(npmCmd, ['run', 'build'], buildOptions, 'Building frontend application');
    console.log(chalk.green('✅ Frontend application built successfully.'));
  } catch (error) {
    console.error(chalk.red('❌ Error building frontend application:'), error.message);
    console.warn(chalk.yellow('Ensure your frontend application has a working \'build\' script in its package.json.'));
    throw error;
  }
}

function getBackendStartCommand(port) {
  // Assuming 'python' is in PATH.
  // Standard command to run FastAPI app with Uvicorn
  const command = 'python';
  const args = [
    '-m',
    'uvicorn',
    'main:app', // Points to main.py -> app instance
    '--host', '0.0.0.0',
    '--port', port.toString()
    // Add --reload only if a specific debug/dev mode for npx is intended, otherwise not for production start
  ];
  return { command, args };
}

function getFrontendStartCommand(port) {
  // Assumes 'npm' is in PATH and frontend has a 'start' script (usually 'next start')
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = [
    'run',
    'start', // This should execute 'next start -p <port>' as per typical Next.js package.json
    '--', // Separator for passing arguments to the script itself
    '--port', port.toString() // Pass port to 'next start'
  ];
  return { command, args };
}

async function startBackend(port) {
  // This function will now be primarily handled by concurrently in the main start command
  // It's kept here conceptually for what 'startBackend' means.
  // The actual spawning is done by concurrently.
  console.log(chalk.blue(`Preparing to start backend on port ${port}...`));
  // Actual start command is constructed by getBackendStartCommand and run by concurrently
  return Promise.resolve(); // Resolve immediately as concurrently handles the process
}

async function startFrontend(port) {
  // This function will now be primarily handled by concurrently in the main start command
  console.log(chalk.blue(`Preparing to start frontend on port ${port}...`));
  // Actual start command is constructed by getFrontendStartCommand and run by concurrently
  return Promise.resolve(); // Resolve immediately as concurrently handles the process
}


// --- MAIN CLI PROGRAM ---
program
  .version('1.1.0') // Updated version for new functionality
  .description('CLI tool for running the Project Manager Suite application.');

program
  .command('start')
  .description('Starts the Project Manager Suite services (backend and frontend).')
  .option('-bp, --backend-port <port_num>', 'Port for the backend server', '8000')
  .option('-fp, --frontend-port <port_num>', 'Port for the frontend server', '3000')
  .action(async (options) => {
    console.log(chalk.bold.cyan('🚀 Launching MCP Project Manager Suite 🚀'));
    console.log(chalk.gray(`Package root: ${packageRootPath}`));
    console.log(chalk.gray(`Backend path: ${backendPath}`));
    console.log(chalk.gray(`Frontend path: ${frontendPath}`));

    // Check prerequisites
    if (!checkNode()) {
      console.error(chalk.red('❌ Error: Node.js is not installed. Please install Node.js and try again.'));
      process.exit(1);
    }
    if (!checkPython()) {
      console.error(chalk.red('❌ Error: Python is not installed. Please install Python and try again.'));
      process.exit(1);
    }
    console.log(chalk.green('✅ Prerequisites met (Node.js & Python found).'));

    const requestedBackendPort = parseInt(options.backendPort, 10);
    const requestedFrontendPort = parseInt(options.frontendPort, 10);
    
    let backendPort = requestedBackendPort;
    let frontendPort = requestedFrontendPort;

    try {
      const detectedBpInitial = await detect(requestedBackendPort);
      if (detectedBpInitial !== requestedBackendPort) {
        console.log(chalk.yellow(`⚠️ Backend port ${requestedBackendPort} is in use. Trying to find an open port...`));
        // Try a few alternatives for backend port
        let foundPort = false;
        for (let i = 1; i <= 5; i++) {
          backendPort = await detect(requestedBackendPort + i);
          if (backendPort === requestedBackendPort + i) {
            console.log(chalk.yellow(`✅ Using backend port ${backendPort} instead.`));
            foundPort = true;
            break;
          }
        }
        if (!foundPort) {
            backendPort = await detect(0); // Get any open port
            if (backendPort) {
                console.log(chalk.yellow(`✅ Using backend port ${backendPort} instead.`));
            } else {
                console.error(chalk.red('❌ Could not find an open port for the backend after several tries.') );
                process.exit(1);
            }
        }
      } else {
        backendPort = detectedBpInitial; // Use the initially detected port if free
      }
    } catch (err) {
        console.error(chalk.red(`Error detecting backend port: ${err.message}`));
        console.log(chalk.yellow('Proceeding with default/requested backend port. If it fails, try specifying a different port with -bp.'))
        // Decide if to proceed with default or exit
    }
    
    try {
      const detectedFpInitial = await detect(requestedFrontendPort);
      if (detectedFpInitial !== requestedFrontendPort) {
        console.log(chalk.yellow(`⚠️ Frontend port ${requestedFrontendPort} is in use. Trying to find an open port...`));
        let foundPort = false;
        for (let i = 1; i <= 5; i++) {
          frontendPort = await detect(requestedFrontendPort + i);
          if (frontendPort === requestedFrontendPort + i) {
            console.log(chalk.yellow(`✅ Using frontend port ${frontendPort} instead.`));
            foundPort = true;
            break;
          }
        }
        if (!foundPort) {
            frontendPort = await detect(0); // Get any open port
            if (frontendPort) {
                console.log(chalk.yellow(`✅ Using frontend port ${frontendPort} instead.`));
            } else {
                console.error(chalk.red('❌ Could not find an open port for the frontend after several tries.'));
                process.exit(1);
            }
        }
      } else {
        frontendPort = detectedFpInitial; // Use the initially detected port if free
      }
    } catch (err) {
        console.error(chalk.red(`Error detecting frontend port: ${err.message}`));
        console.log(chalk.yellow('Proceeding with default/requested frontend port. If it fails, try specifying a different port with -fp.'))
    }


    try {
      console.log(chalk.blue('\\n🔧 Preparing backend...'));
      await installBackendDependencies();

      console.log(chalk.blue('\\n💻 Preparing frontend...'));
      await installFrontendDependenciesAndBuild();
      
      console.log(chalk.green('\\n🎉 Setup complete. Starting services...'));

      // This is a simplified startup. Proper concurrent execution is complex.
      const concurrently = require('concurrently'); 

      const { command: beCommand, args: beArgs } = getBackendStartCommand(backendPort);
      const backendExecution = { 
        command: `${beCommand} ${beArgs.join(' ')}`, // Concurrently typically takes a string command
        name: 'backend', 
        cwd: backendPath, 
        prefixColor: 'blue' 
      };

      const { command: feCommand, args: feArgs } = getFrontendStartCommand(frontendPort);
      const frontendExecution = {
        command: `${feCommand} ${feArgs.join(' ')}`,
        name: 'frontend',
        cwd: frontendPath, 
        prefixColor: 'green'
      };
      
      console.log(chalk.cyan(`Attempting to start backend on: http://localhost:${backendPort}`));
      console.log(chalk.cyan(`Attempting to start frontend at: http://localhost:${frontendPort}`));

      // For now, just print the placeholders and exit, as true service running is for next tasks.
      // console.log(chalk.yellow('\\n🚧 NOTE: Actual service startup (backend & frontend processes) will be implemented in subsequent tasks.'));
      // console.log(chalk.yellow('Current placeholders simulate dependency installation and build steps.'));
      
      // To actually run (once placeholders are real):
      const { result } = concurrently([
          backendExecution,
          frontendExecution 
      ], {
          prefix: 'name',
          timestampFormat: 'HH:mm:ss',
          killOthers: ['failure', 'success'], // Kill other processes if one fails or succeeds (e.g. if a build finishes)
          handleInput: true // Allows input to be passed to processes, e.g., for Ctrl+C
      });

      result.then(
          () => console.log(chalk.green('All services stopped gracefully.')),
          (reason) => {
            // Concurrently's promise rejects if any command fails.
            // The 'reason' is an array of {command, exitCode, killed, index} for each command that didn't succeed.
            console.error(chalk.red('A service failed or was stopped.'));
            reason.forEach(p => {
              if(p.exitCode !== 0 && !p.killed) { // Only log actual errors, not manual kills
                console.error(chalk.red(`Service ${p.command.name} (index ${p.index}) exited with code ${p.exitCode}.`));
              }
            });
          }
      ).catch(err => {
          // This catch is for errors in concurrently itself, not usually for command failures
          console.error(chalk.red('Concurrently execution error:'), err);
      });


    } catch (error) {
      console.error(chalk.red(`❌ Critical error during startup: ${error.message}`));
      if (error.stack) {
          console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse(process.argv); 