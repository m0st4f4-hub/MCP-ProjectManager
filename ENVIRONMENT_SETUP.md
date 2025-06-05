# Environment Setup

This document summarizes the environment variables used by both the backend and frontend services. Copy the provided example files and adjust the values for your local configuration.

## Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and update the variables as needed.

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite+aiosqlite:///./sql_app.db` | Database connection string |
| `TEST_DATABASE_URL` | `sqlite+aiosqlite:///./test.db` | Separate database used for tests |
| `SECRET_KEY` | `mysecretkey` | JWT signing key |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token lifetime in minutes |
| `DEBUG` | `True` | Enables debug mode |
| `OAUTH_CLIENT_ID` | `""` | OAuth client id |
| `OAUTH_CLIENT_SECRET` | `""` | OAuth client secret |
| `OAUTH_SERVER_METADATA_URL` | `""` | OAuth server metadata URL |
| `OAUTH_REDIRECT_URI` | `http://localhost:8000/auth/oauth/callback` | OAuth redirect URI |
| `OAUTH_SCOPE` | `openid email profile` | OAuth scopes |

Create or modify `backend/.env` to override these values in your environment. Docker or production deployments can supply the same variables via the container runtime.

## Frontend (`frontend/.env.local`)

Copy `frontend/.env.local.example` to `frontend/.env.local`.

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | Base URL for API requests |

Adjust `frontend/.env.local` if your backend runs on a different host or port.

---

These defaults work for local development when running the backend on port `8000` and the frontend on `3000`. Override any variable to suit your own setup.
