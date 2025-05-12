#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
let detect = require('detect-port');
if (detect && typeof detect !== 'function' && detect.default) {
  detect = detect.default;
}

// Utility function to run commands with spinner
async function runWithSpinner(command, args, options, spinnerText) {
  const spinner = ora(spinnerText).start();
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);
    
    process.on('error', (error) => {
      spinner.fail(chalk.red(`Failed: ${error.message}`));
      reject(error);
    });

    process.on('close', (code) => {
      if (code === 0) {
        spinner.succeed(chalk.green(`${spinnerText} completed successfully`));
        resolve();
      } else {
        spinner.fail(chalk.red(`${spinnerText} failed with code ${code}`));
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

// Function to check if Python is installed
function checkPython() {
  try {
    execSync('python --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Function to check if Node.js is installed
function checkNode() {
  try {
    execSync('node --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Function to install backend dependencies
async function setupBackend() {
  if (!fs.existsSync('backend')) {
    fs.mkdirSync('backend');
  }

  // Create virtual environment
  await runWithSpinner('python', ['-m', 'venv', 'backend/.venv'], {}, 'Creating Python virtual environment');

  // Install backend dependencies
  const pipCmd = process.platform === 'win32' ? 'backend\\.venv\\Scripts\\pip' : 'backend/.venv/bin/pip';
  await runWithSpinner(pipCmd, ['install', 'fastapi', 'uvicorn', 'sqlalchemy', 'alembic', 'psycopg2-binary'], {}, 'Installing backend dependencies');
}

// Function to install frontend dependencies
async function setupFrontend() {
  if (!fs.existsSync('frontend')) {
    fs.mkdirSync('frontend');
  }

  try {
    console.log(chalk.yellow('Checking frontend package.json...'));
    if (!fs.existsSync('frontend/package.json')) {
      console.log(chalk.yellow('Creating basic package.json for frontend...'));
      const basicPackageJson = {
        "name": "mcp-task-manager-frontend",
        "version": "0.1.0",
        "private": true,
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start"
        },
        "dependencies": {
          "next": "^13.4.19",
          "react": "^18.2.0",
          "react-dom": "^18.2.0"
        }
      };
      fs.writeFileSync('frontend/package.json', JSON.stringify(basicPackageJson, null, 2));
    }

    // Use full path to npm
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    console.log(chalk.blue('Installing frontend dependencies with', npmCmd));
    
    // Install frontend dependencies
    await runWithSpinner(npmCmd, ['install'], { cwd: 'frontend', shell: true }, 'Installing frontend dependencies');
  } catch (error) {
    console.log(chalk.red('Error setting up frontend:', error.message));
    console.log(chalk.yellow('You may need to set up the frontend manually:'));
    console.log(chalk.yellow('1. cd frontend'));
    console.log(chalk.yellow('2. npm install'));
    console.log(chalk.yellow('3. npm run dev'));
  }
}

// Function to start services with auto-restart
function startServices(backendPort = 8080, frontendPort = 3000) {
  try {
    const concurrently = require('concurrently');
    
    console.log(chalk.blue('Starting services with auto-restart...'));
    console.log(chalk.gray(`Backend URL: http://localhost:${backendPort}`));
    console.log(chalk.gray(`Frontend URL: http://localhost:${frontendPort}`));
    console.log(chalk.gray(`API docs: http://localhost:${backendPort}/docs`));
    
    // Create a basic main.py file if it doesn't exist
    if (!fs.existsSync('backend/main.py')) {
      console.log(chalk.yellow('Creating a basic FastAPI main.py file...'));
      
      const mainPyContent = `
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MCP Task Manager API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the MCP Task Manager API"}

@app.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    return tasks

@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)
`;

      // Also create other necessary files
      if (!fs.existsSync('backend/database.py')) {
        const databasePyContent = `
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
`;
        fs.writeFileSync('backend/database.py', databasePyContent);
      }

      if (!fs.existsSync('backend/models.py')) {
        const modelsPyContent = `
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    project_id = Column(String, nullable=True)
`;
        fs.writeFileSync('backend/models.py', modelsPyContent);
      }

      if (!fs.existsSync('backend/schemas.py')) {
        const schemasPyContent = `
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    project_id: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    created_at: datetime

    class Config:
        orm_mode = True
`;
        fs.writeFileSync('backend/schemas.py', schemasPyContent);
      }

      if (!fs.existsSync('backend/crud.py')) {
        const crudPyContent = `
from sqlalchemy.orm import Session
import models, schemas
import uuid
from datetime import datetime

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Task).offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        id=str(uuid.uuid4()),
        title=task.title,
        description=task.description,
        completed=task.completed,
        project_id=task.project_id,
        created_at=datetime.utcnow()
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task
`;
        fs.writeFileSync('backend/crud.py', crudPyContent);
      }

      // Write main.py after all other files are created
      fs.writeFileSync('backend/main.py', mainPyContent);
    }

    // Create a simple Next.js app if it doesn't exist
    if (!fs.existsSync('frontend/src')) {
      console.log(chalk.yellow('Setting up basic Next.js frontend...'));
      
      // Create required directories
      if (!fs.existsSync('frontend/src')) {
        fs.mkdirSync('frontend/src', { recursive: true });
      }
      
      if (!fs.existsSync('frontend/src/app')) {
        fs.mkdirSync('frontend/src/app', { recursive: true });
      }
      
      // Create a basic page.tsx file
      const pageTsxContent = `
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">MCP Task Manager</h1>
      <p>Frontend is running! Connect to the backend to start managing tasks.</p>
    </main>
  )
}
`;
      fs.writeFileSync('frontend/src/app/page.tsx', pageTsxContent);
      
      // Create a layout file
      const layoutTsxContent = `
export const metadata = {
  title: 'MCP Task Manager',
  description: 'A full-stack task manager application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
      fs.writeFileSync('frontend/src/app/layout.tsx', layoutTsxContent);
    }
    
    const pythonCmd = process.platform === 'win32' ? '.\\backend\\.venv\\Scripts\\python' : './backend/.venv/bin/python';
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const { result } = concurrently([
      {
        command: process.platform === 'win32' 
          ? `${pythonCmd} -m uvicorn backend.main:app --host 127.0.0.1 --port ${backendPort} --reload`
          : `${pythonCmd} -m uvicorn backend.main:app --host 127.0.0.1 --port ${backendPort} --reload`,
        name: 'backend',
        prefixColor: 'blue'
      },
      {
        command: process.platform === 'win32'
          ? `cd frontend && set NODE_OPTIONS=--max-old-space-size=2048 && npx next dev --port ${frontendPort}`
          : `cd frontend && NODE_OPTIONS=--max-old-space-size=2048 npx next dev --port ${frontendPort}`,
        name: 'frontend',
        prefixColor: 'green'
      }
    ], {
      prefix: 'name',
      timestampFormat: 'HH:mm:ss',
      restartTries: 3,
      restartDelay: 3000
    });

    result.then(
      () => {
        console.log(chalk.green('All processes completed successfully'));
      },
      (err) => {
        console.error(chalk.red('Error occurred:', err));
      }
    );
  } catch (error) {
    console.error(chalk.red('Failed to start services:', error.message));
    console.log(chalk.yellow('You may need to start services manually:'));
    console.log(chalk.yellow(`1. Backend: python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port ${backendPort}`));
    console.log(chalk.yellow(`2. Frontend: cd frontend && npm run dev -- --port ${frontendPort}`));
  }
}

async function ensureRulesCopied() {
  // Try to find rules directory relative to CLI script and cwd
  let rulesSrc = path.join(__dirname, '.cursor', 'rules');
  if (!fs.existsSync(rulesSrc)) {
    rulesSrc = path.join(process.cwd(), '.cursor', 'rules');
  }
  // If still not found, try to clone the rules repo
  if (!fs.existsSync(rulesSrc)) {
    console.log(chalk.yellow('Rules directory not found. Cloning rules repo...'));
    try {
      execSync('git clone --depth 1 https://github.com/m0st4f4-hub/.cursor .cursor', { stdio: 'inherit' });
    } catch (e) {
      console.error(chalk.red('Failed to clone rules repo:', e.message));
      throw new Error('Could not obtain rules files.');
    }
  }
  if (!fs.existsSync(rulesSrc)) {
    console.error(chalk.red('Rules directory still not found after clone.'));
    throw new Error('Could not obtain rules files.');
  }
  // Copy rules files to backend/rules
  const rulesDest = path.join(process.cwd(), 'backend', 'rules');
  if (!fs.existsSync(rulesDest)) {
    fs.mkdirSync(rulesDest, { recursive: true });
  }
  let copied = false;
  fs.readdirSync(rulesSrc).forEach(file => {
    if (file.endsWith('.mdc')) {
      const srcFile = path.join(rulesSrc, file);
      const destFile = path.join(rulesDest, file);
      fs.copyFileSync(srcFile, destFile);
      copied = true;
    }
  });
  if (!copied) {
    console.error(chalk.red('No .mdc rules files found in rules directory.'));
    throw new Error('No rules files found.');
  }
  console.log(chalk.green('Rules files copied to backend/rules.'));
}

// Main CLI program
program
  .version('1.0.0')
  .description('Project Manager CLI');

program
  .command('start')
  .description('Start the Project Manager services with auto-restart')
  .option('--backend-port <port>', 'Port for backend API', '8080')
  .option('--frontend-port <port>', 'Port for frontend UI', '3000')
  .action(async (cmd) => {
    const requestedBackendPort = parseInt(cmd.backendPort, 10);
    const requestedFrontendPort = parseInt(cmd.frontendPort, 10);
    // Find available backend port
    let backendPort = await detect(requestedBackendPort);
    let frontendPort = await detect(requestedFrontendPort);
    // If requested port is busy, try next 10 ports
    let tries = 0;
    while ((backendPort !== requestedBackendPort || frontendPort !== requestedFrontendPort) && tries < 10) {
      if (backendPort !== requestedBackendPort) backendPort = await detect(requestedBackendPort + tries);
      if (frontendPort !== requestedFrontendPort) frontendPort = await detect(requestedFrontendPort + tries);
      tries++;
    }
    if (backendPort !== requestedBackendPort) {
      console.log(chalk.yellow(`Backend port ${requestedBackendPort} is in use. Using ${backendPort} instead.`));
    }
    if (frontendPort !== requestedFrontendPort) {
      console.log(chalk.yellow(`Frontend port ${requestedFrontendPort} is in use. Using ${frontendPort} instead.`));
    }
    console.log(chalk.blue('Starting Project Manager...'));
    
    // Check requirements
    if (!checkNode()) {
      console.error(chalk.red('Node.js is not installed. Please install Node.js first.'));
      process.exit(1);
    }

    if (!checkPython()) {
      console.error(chalk.red('Python is not installed. Please install Python first.'));
      process.exit(1);
    }

    try {
      // Setup backend and frontend
      await setupBackend();
      await setupFrontend();
      // Ensure rules are copied
      await ensureRulesCopied();
      // Start services with selected ports
      console.log(chalk.green(`\nStarting services...`));
      startServices(backendPort, frontendPort);
    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  });

program.parse(process.argv); 