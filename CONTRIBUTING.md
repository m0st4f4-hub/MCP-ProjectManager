Here is the fully merged and finalized version of the `CONTRIBUTING.md` file, incorporating the `update-readmes` script section into the comprehensive contribution guide:

````markdown
# Contributing Guide

Thank you for taking the time to contribute to **MCP Project Manager**! This project follows several conventions to ensure a clean, reliable, and collaborative development process.

---

## 🔧 Install Dependencies

### 1. Backend (Python)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
````

### 2. Frontend (Node.js)

```bash
cd frontend
npm install
```

---

## 🧹 Set Up Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to automatically check code quality and enforce consistency.

### Install `pre-commit` and activate hooks:

```bash
pip install pre-commit
pre-commit install
```

### What gets checked:

* **Backend**: `flake8` runs on Python files
* **Frontend**: `npm run lint` and `npm run type-check` run on JS/TS files (the type check can also be triggered from the repo root with `npm run type-check`)
* **Lint Staged Files**: `npx lint-staged` automatically fixes and formats only the files you commit using the config in `frontend/package.json`

These checks will automatically run on every commit.

---

## 📝 Before Committing Documentation Changes

Run the README update script to refresh file lists:

```bash
npm run update-readmes
```

This ensures all `README.md` files reflect up-to-date directory contents.

Run the enum generation script to sync frontend types with backend enums:

```bash
npm run generate
```

This writes `frontend/src/types/generatedEnums.ts`.

---

## 📐 Coding Standards

* Follow existing code structure and conventions.
* Keep code self-explanatory and remove unused code.
* **Frontend**:

  * Run: `npm run lint`, `npm run type-check`, `npm run fix`, and `npm run format` before committing.
* **Backend**:

  * Run: `flake8` and ensure no style violations or unused imports remain.

---

## 🧾 Commit Style

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) to maintain clean history and enable automatic changelog generation.

### Examples:

```bash
feat: add project deadline editing modal
fix: resolve crash on null status ID
docs: update instructions for local setup
```

Always prefix commits with `feat`, `fix`, `chore`, `docs`, etc.
Reference related issues when applicable (e.g. `fix: #42`).

---

## ✅ Test Requirements

Before opening a Pull Request, ensure the following tests and linters pass:

### Frontend

```bash
cd frontend
npm run lint
npm run type-check
cd ..
npm run prettier:check
cd frontend
npx vitest run --coverage.v8 --coverage-threshold=90
```

### Backend

```bash
cd backend
flake8 .
pytest --cov=. --cov-fail-under=90
```

All tests and linters must pass locally before submitting a PR.

---

## 🤝 Thank You

Your contributions help make this project better.
Whether it's fixing a bug, improving documentation, or adding a new feature—we appreciate your effort.

```
```
