# Contributing

Thank you for taking the time to contribute to MCP Project Manager! Follow these steps to get your environment ready.

## Install Dependencies

1. **Python**
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Node.js**
   ```bash
   cd frontend
   npm install
   ```

## Set Up Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to run linting checks automatically.

1. Install `pre-commit`:
   ```bash
   pip install pre-commit
   ```
2. Install the hooks:
   ```bash
   pre-commit install
   ```

The hooks will run `flake8` on Python files and `npm run lint` for the frontend whenever you commit.
