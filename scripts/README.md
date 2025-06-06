# Scripts Directory

This directory contains all development and utility scripts for the MCP Project Manager, organized for better maintainability and discoverability.

## 📁 Directory Structure

```
scripts/
├── dev/                    # Development launchers and tools
│   ├── dev_launcher.js     # Node.js development launcher
│   ├── dev_launcher.ps1    # PowerShell development launcher
│   └── dev_launcher.bat    # Batch file launcher
├── utils/                  # Utility scripts and CLI tools
│   └── cli.js              # Main CLI utility
└── README.md               # This file
```

## 🚀 Development Launchers

### Quick Start Commands

From the project root:

```bash
# Using Node.js launcher (cross-platform)
node scripts/dev/dev_launcher.js

# Using PowerShell (Windows)
.\scripts\dev\dev_launcher.ps1

# Using Batch file (Windows)
.\scripts\dev\dev_launcher.bat

# Using CLI utility
node scripts/utils/cli.js dev
```

### What the Launchers Do

- **`dev_launcher.js`** - Node.js-based development launcher
- **`dev_launcher.ps1`** - PowerShell development launcher for Windows
- **`dev_launcher.bat`** - Batch file launcher for Windows

All launchers perform the same operations:
1. Clear ports 8000 and 3000
2. Apply database migrations
3. Start the FastAPI backend on port 8000
4. Start the Next.js frontend on port 3000

## 🛠️ CLI Utilities

### Main CLI (`scripts/utils/cli.js`)

The main CLI provides several commands:

```bash
# Start development servers
node scripts/utils/cli.js dev

# Run database migrations
node scripts/utils/cli.js migrate

# Setup environment (runs init scripts)
node scripts/utils/cli.js setup
```

## 📋 Usage Examples

### Development Mode

Start both backend and frontend in development mode:

```bash
# From project root
node scripts/dev/dev_launcher.js
```

This will:
- Kill any processes on ports 8000/3000
- Apply database migrations
- Start backend at http://localhost:8000
- Start frontend at http://localhost:3000
- Show API docs at http://localhost:8000/docs

### Database Migrations

Apply pending migrations:

```bash
node scripts/utils/cli.js migrate
```

### Environment Setup

Run initial environment setup:

```bash
node scripts/utils/cli.js setup
```

## 🔧 Script Details

### Development Launcher Features

- **Cross-platform compatibility** - Works on Windows, macOS, and Linux
- **Port management** - Automatically clears ports before starting
- **Migration handling** - Applies database migrations before starting servers
- **Process management** - Handles graceful shutdown with Ctrl+C
- **Error handling** - Provides clear error messages and status updates

### CLI Features

- **Command-based interface** - Clear subcommands for different operations
- **Help system** - Built-in help for all commands
- **Version information** - Shows package version
- **Error handling** - Comprehensive error reporting

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**: The launchers automatically clear ports 8000 and 3000
2. **Python virtual environment not found**: Ensure backend setup is complete
3. **Node modules missing**: Run `npm install` in the frontend directory
4. **Database migration errors**: Check database connection and permissions

### Debug Mode

For verbose output, you can modify the launcher scripts to include debug flags:

```bash
# Add --verbose flag to uvicorn command in dev_launcher.js
# Add --debug flag to npm run dev command
```

## 📚 Related Documentation

- [Setup Guide](../docs/02-setup/README.md) - Complete setup instructions
- [Development Guide](../docs/03-development/README.md) - Development workflows and standards
- [Operations Guide](../docs/08-operations/README.md) - Troubleshooting and maintenance

## 🔄 Migration from Root Scripts

The following scripts have been moved from the project root:

- `dev_launcher.js` → `scripts/dev/dev_launcher.js`
- `dev_launcher.ps1` → `scripts/dev/dev_launcher.ps1`
- `dev_launcher.bat` → `scripts/dev/dev_launcher.bat`
- `cli.js` → `scripts/utils/cli.js`

All functionality remains the same, but paths have been updated for better organization 