.PHONY: setup-backend setup-frontend test lint dev migrate format

setup-backend:
	python -m venv backend/.venv
	backend/.venv/bin/pip install -r backend/requirements.txt

setup-frontend:
	cd frontend && npm install

# Run backend and frontend tests
# Requires backend/.venv to be created first

test:
	cd backend && ../backend/.venv/bin/pytest -v
	cd frontend && npm test

# Lint Python and TypeScript code
lint:
	cd backend && ../backend/.venv/bin/flake8 .
	cd frontend && npm run lint

dev:
	python start_system.py

migrate:
	cd backend && ../backend/.venv/bin/alembic upgrade head

format:
	cd backend && ../backend/.venv/bin/python comprehensive_flake8_fixer.py
	cd frontend && npm run format
