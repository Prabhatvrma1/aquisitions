# Acquisitions API

A production-ready RESTful API built with **Express.js** for managing user authentication and full User CRUD. Uses Drizzle ORM with a **Neon PostgreSQL** (serverless) database, Docker for containerized deployments, and GitHub Actions for CI/CD.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://production-ready-node-api.vercel.app)
[![Lint & Format](https://github.com/Prabhatvrma1/production-ready-node-api/actions/workflows/lint-and-format.yml/badge.svg)](https://github.com/Prabhatvrma1/production-ready-node-api/actions/workflows/lint-and-format.yml)
[![Tests](https://github.com/Prabhatvrma1/production-ready-node-api/actions/workflows/tests.yml/badge.svg)](https://github.com/Prabhatvrma1/production-ready-node-api/actions/workflows/tests.yml)
[![Docker Build & Push](https://github.com/Prabhatvrma1/production-ready-node-api/actions/workflows/docker-build-and-push.yml/badge.svg)](https://github.com/Prabhatvrma1/production-ready-node-api/actions/workflows/docker-build-and-push.yml)
[![Docker Hub](https://img.shields.io/docker/v/prabhatsoni16/aquisitions?label=Docker%20Hub)](https://hub.docker.com/r/prabhatsoni16/aquisitions)

---

## Tech Stack

| Category         | Technology                                  |
| ---------------- | ------------------------------------------- |
| Runtime          | Node.js 20 (ES Modules)                     |
| Framework        | Express.js v5                               |
| Database         | PostgreSQL via Neon Serverless              |
| ORM              | Drizzle ORM                                 |
| Auth             | JWT (jsonwebtoken) + bcrypt                 |
| Validation       | Zod                                         |
| Logging          | Winston + Morgan                            |
| Security         | Helmet, CORS, Arcjet (rate-limiting + bots) |
| Containerization | Docker + Docker Compose                     |
| CI/CD            | GitHub Actions                              |

---

## Architecture Diagram

```mermaid
graph TD
    Client([Client / Frontend]) -->|HTTP/REST| API[Express.js API]
    API -->|JWT| Auth[Authentication]
    API -->|TCP/SQL| Proxy[Neon HTTP Proxy / Local]
    Proxy -->|TCP/SQL| DB[(Neon PostgreSQL)]

    subgraph Docker Containers
        API
        Proxy
        LocalDB[(Neon Local DB)]
    end

    Proxy -.->|Dev Only| LocalDB
```

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       ├── lint-and-format.yml       # ESLint + Prettier CI check
│       ├── tests.yml                 # Test runner + coverage upload
│       └── docker-build-and-push.yml # Multi-platform Docker build & push
├── scripts/
│   ├── setup-docker-win.ps1          # Windows dev startup script
│   ├── setup-docker.sh               # Linux/Mac dev startup script
│   └── prod-win.ps1                  # Windows production startup script
├── src/
│   ├── index.js                      # Entry point
│   ├── server.js                     # HTTP server setup
│   ├── app.js                        # Express app + middleware
│   ├── config/
│   │   ├── database.js               # Neon + Drizzle connection (env-aware)
│   │   └── logger.js                 # Winston logger
│   ├── controllers/
│   │   ├── auth.controler.js         # signup / signin / signout
│   │   └── users.controller.js       # Full User CRUD handlers
│   ├── middleware/
│   │   ├── auth.middleware.js         # authenticate + authorize middleware
│   │   └── security.middleware.js     # Arcjet rate-limiting + bot protection
│   ├── models/
│   │   └── user.model.js             # Drizzle schema for users table
│   ├── routes/
│   │   ├── auht.routes.js            # Auth routes
│   │   └── users.routes.js           # User CRUD routes (protected)
│   ├── services/
│   │   ├── auth.service.js           # Auth business logic
│   │   └── users.service.js          # User CRUD business logic
│   ├── utils/
│   │   ├── cookies.js                # Cookie helpers
│   │   ├── format.js                 # Zod error formatter
│   │   └── jwt.js                    # JWT sign & verify
│   └── validations/
│       ├── auth.validation.js        # Zod: signup / signin schemas
│       └── users.validation.js       # Zod: userIdSchema / updateUserSchema
├── Dockerfile
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── drizzle.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A [Neon](https://neon.tech/) project

---

## Docker Environments

### Development (Neon Local — Ephemeral Branch)

In development, the app runs next to **Neon Local**, which automatically forks an ephemeral database branch from your Neon Cloud project. The branch is torn down when you stop Docker.

**Fill in `.env.development`:**

```env
NEON_API_KEY=         # Neon Account Settings → API Keys
NEON_PROJECT_ID=      # Your Neon project ID
PARENT_BRANCH_ID=     # Branch to fork from (usually main)
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb
NODE_ENV=development
JWT_SECRET=your_dev_secret
ARCJET_KEY=your_arcjet_key
```

**Start dev environment (Windows):**

```bash
npm run dev:docker-win
```

**Start dev environment (Mac/Linux):**

```bash
npm run dev:docker
```

This starts three containers:

1. `neon-local` — Neon Local proxy, manages ephemeral DB branching.
2. `neon-http-proxy` — Bridges `@neondatabase/serverless` HTTP driver to Neon Local TCP.
3. `app` — Express server with hot-reload (`node --watch`).

---

### Production (Neon Cloud)

In production, the app connects directly to Neon Cloud with no local proxy.

**Fill in `.env.production`:**

```env
DATABASE_URL=postgres://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require
NODE_ENV=production
JWT_SECRET=your_strong_production_secret
ARCJET_KEY=your_arcjet_key
```

**Start production environment (Windows):**

```bash
npm run prod:docker-win
```

This script will:

1. Run `drizzle-kit migrate` to push schema changes to Neon Cloud.
2. Build a lean production Docker image (no dev dependencies).
3. Start the container in detached mode.

---

## API Reference

### General

| Method | Endpoint  | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/`       | Welcome message          |
| GET    | `/health` | Health check with uptime |
| GET    | `/api`    | API status               |

---

### Authentication — `/api/auth`

| Method | Endpoint             | Auth Required | Description          |
| ------ | -------------------- | ------------- | -------------------- |
| POST   | `/api/auth/sign-up`  | No            | Register a new user  |
| POST   | `/api/auth/sign-in`  | No            | Sign in & get cookie |
| POST   | `/api/auth/sign-out` | No            | Clear auth cookie    |

#### Sign Up `POST /api/auth/sign-up`

```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "user"
}

// Response 201
{
  "message": "User registered successfully",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

#### Sign In `POST /api/auth/sign-in`

```json
// Request
{ "email": "john@example.com", "password": "securepassword" }

// Response 200 — also sets HttpOnly cookie `token`
{
  "message": "User signed in successfully",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" }
}
```

---

### Users — `/api/users` _(requires auth cookie)_

| Method | Endpoint         | Roles Allowed          | Description                           |
| ------ | ---------------- | ---------------------- | ------------------------------------- |
| GET    | `/api/users`     | Any authenticated user | Get all users                         |
| GET    | `/api/users/:id` | Any authenticated user | Get a user by ID                      |
| PATCH  | `/api/users/:id` | Self or Admin          | Update user fields (role: Admin only) |
| DELETE | `/api/users/:id` | Self or Admin          | Delete a user                         |

All routes require a valid `token` cookie (obtained from sign-in / sign-up).

#### Get All Users `GET /api/users`

```json
// Response 200
{
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

#### Get User by ID `GET /api/users/:id`

```json
// Response 200
{
  "message": "User retrieved successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Update User `PATCH /api/users/:id`

All fields are optional. Non-admins cannot change `role`.

```json
// Request (partial update is supported)
{ "name": "Jane Doe", "email": "jane@example.com" }

// Response 200
{
  "message": "User updated successfully",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
}
```

#### Delete User `DELETE /api/users/:id`

```json
// Response 200
{ "message": "User deleted successfully" }
```

**Error Responses:**

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| 400    | Validation error (bad ID or body)            |
| 401    | Not authenticated (missing/invalid token)    |
| 403    | Forbidden (not your account or not an admin) |
| 404    | User not found                               |
| 409    | Email already in use                         |

---

## CI/CD Pipelines

Three GitHub Actions workflows are configured under `.github/workflows/`:

### 1. `lint-and-format.yml` — Lint & Format

Triggered on push/PR to `main` and `staging`.

- Runs **ESLint** (`npm run lint`)
- Runs **Prettier** check (`npm run format-check`)
- On failure, surfaces annotations pointing to `npm run lint:fix` and `npm run format`

### 2. `tests.yml` — Tests

Triggered on push/PR to `main` and `staging`.

- Runs test suite with `npm test -- --coverage`
- Uploads coverage reports as artifacts (30-day retention)
- Generates a GitHub step summary with pass/fail status and coverage table

> **Required secrets:** `TEST_DATABASE_URL`, `JWT_SECRET`, `ARCJET_KEY`

### 3. `docker-build-and-push.yml` — Docker Build & Push

Triggered on push to `main` or manually via `workflow_dispatch`.

- Builds a multi-platform image (`linux/amd64`, `linux/arm64`) targeting the `production` Dockerfile stage
- Pushes to Docker Hub at **`prabhatsoni16/aquisitions`** with 4 tags:
  - `latest`
  - branch name (e.g. `main`)
  - commit SHA (e.g. `sha-a1b2c3d`)
  - timestamp (e.g. `prod-20260706-152201`)
- Uses GitHub Actions cache for fast layer rebuilds
- Appends a summary with the image name, tags, and digest

> **Required secrets:** `DOCKER_USERNAME`, `DOCKER_PASSWORD`

---

## Available Scripts

| Script                    | Description                         |
| ------------------------- | ----------------------------------- |
| `npm run dev`             | Start dev server with hot-reload    |
| `npm run start`           | Start production server             |
| `npm run lint`            | Run ESLint                          |
| `npm run lint:fix`        | Auto-fix ESLint issues              |
| `npm run format`          | Format code with Prettier           |
| `npm run format-check`    | Check code formatting (no writes)   |
| `npm run db:push`         | Push schema directly to database    |
| `npm run db:generate`     | Generate migration files            |
| `npm run db:migrate`      | Run pending migrations              |
| `npm run db:studio`       | Open Drizzle Studio GUI             |
| `npm run dev:docker-win`  | Start full dev stack on Windows     |
| `npm run dev:docker`      | Start full dev stack on Mac/Linux   |
| `npm run prod:docker-win` | Start production stack on Windows   |
| `npm run prod:docker`     | Start production stack on Mac/Linux |

---

## Logging

Logs are written to:

- `logs/error.log` — Error-level logs only
- `logs/combined.log` — All levels

In non-production environments, logs are also printed to the console with color formatting.

---

## GitHub Secrets Required

| Secret              | Used by               | Description                                            |
| ------------------- | --------------------- | ------------------------------------------------------ |
| `DOCKER_USERNAME`   | docker-build-and-push | Docker Hub username                                    |
| `DOCKER_PASSWORD`   | docker-build-and-push | Docker Hub password / access token for `prabhatsoni16` |
| `TEST_DATABASE_URL` | tests                 | PostgreSQL URL for test environment                    |
| `JWT_SECRET`        | tests                 | Secret key for JWT in tests                            |
| `ARCJET_KEY`        | tests                 | Arcjet API key for security middleware                 |

---

## Screenshots

_(Add screenshots of your API responses, swagger docs, or database GUI here)_

---

## Future Roadmap

- [ ] Add Redis for caching API responses
- [ ] Implement Swagger/OpenAPI documentation
- [ ] Add OAuth2 login (Google/GitHub)
- [ ] Set up CD to automatically deploy to AWS/Render/DigitalOcean
- [ ] Add comprehensive E2E tests

---

## License

ISC
