# minilb backend

This backend powers the mini load balancer dashboard and simulation engine. It exposes FastAPI routes for authentication, server management, simulation orchestration, and analytics.

## Overview

- FastAPI app with SQLAlchemy persistence and JWT-based authentication.
- Server and simulation data are stored in SQLite by default, with PostgreSQL support via `DATABASE_URL`.
- The API supports user registration/login, admin-only server mutation, simulation execution, and WebSocket-based live updates.
- The app is designed around a load balancer runtime and multiple simulation algorithms.

## Key modules

- `main.py` — app bootstrap, CORS config, route registration, root route, health checks.
- `database/database.py` — engine, session factory, Base metadata, and startup bootstrap logic.
- `models/db_model.py` — ORM models for `Server`, `ServerHealth`, `User`, and `Simulation`.
- `models/schema.py` — request/response schemas for the API.
- `api/routes/auth.py` — registration, login, and authenticated user endpoint.
- `api/routes/server.py` — CRUD, filtering, and server field metadata endpoints.
- `api/routes/simulation.py` — simulation creation, start/stop, logs, duplicates, and websocket streaming.
- `api/routes/statistics.py` — aggregate metrics for dashboard analytics.
- `core/security.py` — password hashing and JWT operations.
- `core/bootstrap.py` — creates the default admin account from environment variables.
- `core/load_balancer.py` — runtime load balancing logic and server snapshot conversion.
- `core/simulation_engine.py` — request simulation engine.
- `core/websocket_manager.py` — live simulation updates over WebSocket.

## Environment variables

Create a `.env` file in the backend root or export these variables before running the app:

```bash
DATABASE_URL=sqlite:///./dev.db
JWT_SECRET_KEY=change-me-in-production
AUTH_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123
ADMIN_NAME=Admin
```

Notes:

- If `DATABASE_URL` is not set, the app falls back to `sqlite:///./dev.db`.
- If the database URL starts with `postgres://`, it is converted to the SQLAlchemy-compatible `postgresql://` form.
- The default admin is created automatically if credentials are present and no matching admin already exists.

## Install and run

From the backend directory:

```bash
python -m venv lbenv
lbenv\Scripts\activate   # Windows
# or: source lbenv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The app creates tables and bootstraps the default admin during import.

## API surface

### Authentication

- `POST /auth/register`
    - Creates a new user.
    - Body: `name`, `email`, `password`.

- `POST /auth/login`
    - Uses OAuth2 password flow with `username` as the email value.
    - Returns `access_token` and `token_type`.

- `GET /auth/me`
    - Returns the currently authenticated user.

### Servers

- `POST /servers/`
    - Admin-only.
    - Creates a `Server` and an associated `ServerHealth` row.

- `GET /servers/`
    - Authenticated user.
    - Returns a paginated-style list object with `count` and `servers`.

- `PUT /servers/{server_id}`
    - Admin-only.
    - Updates one or more server fields.

- `DELETE /servers/{server_id}`
    - Admin-only.
    - Removes the server and related health record.

- `POST /servers/filter`
    - Authenticated user.
    - Builds a filter expression from a `FilterInput` payload.

- `GET /servers/filter/fields`
    - Returns dynamic field metadata for the frontend filter builder.

### Simulations

- `POST /simulations/`
    - Creates a simulation owned by the authenticated user.

- `GET /simulations/`
    - Lists simulations; non-admin users only see their own.

- `GET /simulations/{sim_id}`
    - Fetches a single simulation.

- `POST /simulations/{sim_id}/start`
    - Starts a simulation in the background.

- `POST /simulations/{sim_id}/stop`
    - Sends a cancel signal to the running engine.

- `GET /simulations/{sim_id}/logs`
    - Returns stored simulation logs.

- `DELETE /simulations/{sim_id}/logs`
    - Deletes saved logs.

- `POST /simulations/{sim_id}/duplicate`
    - Creates a copy of an existing simulation.

- `DELETE /simulations/{sim_id}`
    - Deletes a simulation.

- `DELETE /simulations/`
    - Admin-only bulk reset of all simulations.

- `WebSocket /simulations/ws/{sim_id}`
    - Streams live simulation progress to an authenticated client using a JWT token in the query string.

### Statistics

- `GET /stats/`
    - Admin-only.
    - Returns server totals, health statistics, request distribution, and load-balance balance metrics.

## Data model summary

### Server

The `Server` model includes:

- `id`
- `name`
- `hostname`
- `ip_address`
- `port`
- `status`
- `maintenance_mode`
- `weight`
- `priority`
- `max_connections`
- `cpu`
- `memory`
- `region`
- `country`
- `datacenter`
- `supports_sticky_session`
- `created_at`
- `updated_at`

### ServerHealth

Runtime metrics are stored in a one-to-one relation:

- `active_connections`
- `current_requests`
- `response_time_ms`
- `average_latency_ms`
- `error_rate`
- `cpu_usage`
- `memory_usage`
- `network_usage`
- `last_health_check`

### User

- `name`
- `email`
- `hashed_password`
- `role` (`admin` or `user`)
- `is_active`
- `created_at`

### Simulation

- `name`
- `algorithm`
- `user_id`
- `traffic_waves`
- `status`
- `result_summary`
- `created_at`

## Authentication and authorization

- JWT is used for API auth.
- `get_current_user()` validates the token and loads the user from the database.
- `require_admin()` restricts admin-only endpoints.
- Rate limiting is enforced via `slowapi` and keyed by authenticated user or IP when unauthenticated.

## Example requests

Register a user:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"StrongPassword123"}'
```

Login:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "username=demo@example.com" \
  --data-urlencode "password=StrongPassword123"
```

Create a server:

```bash
curl -X POST http://localhost:8000/servers/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "backend-1",
    "hostname": "backend-1.local",
    "ip_address": "127.0.0.1",
    "port": 8001,
    "weight": 2,
    "cpu": 4,
    "memory": 4096,
    "region": "us-east",
    "supports_sticky_session": true
  }'
```

List servers:

```bash
curl http://localhost:8000/servers/ \
  -H "Authorization: Bearer <token>"
```

Create a simulation:

```bash
curl -X POST http://localhost:8000/simulations/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "simulation_name": "demo-run",
    "algorithm": "round_robin",
    "traffic_waves": [
      {"wave": 1, "requests": 100, "interval_ms": 50}
    ]
  }'
```

## Notes

- The app expects the frontend to send the JWT in the `Authorization: Bearer ...` header.
- Server health data is stored separately from the server record and is intended for runtime analytics and metrics.
- Simulation status and live progress are tracked through the database and WebSocket stream.
- The backend uses `create_all` during startup and a bootstrap function to seed an admin user when configured.
