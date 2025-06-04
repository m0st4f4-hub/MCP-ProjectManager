# Contributing Guide

Thank you for taking the time to contribute to **MCP Project Manager**! This project follows a few conventions to keep the codebase consistent and reliable.

## Coding Standards

- Use the existing patterns in the repository. For the frontend run `npm run fix` and `npm run format` before committing.
- For backend changes run `flake8` and fix issues using the provided scripts. Keep code self-explanatory and avoid unused imports.

## Commit Style

- Use [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `docs:`) with short imperative messages.
- Reference related issues or tickets when applicable.

## Test Requirements

Before opening a pull request:

1. Run the frontend linter and tests:
   ```bash
   cd frontend
   npm run lint
   npm test
   ```
2. Run backend tests:
   ```bash
   cd backend
   pytest
   ```

All tests and linters should pass locally prior to submitting a PR.
