# Acquisitions API

A RESTful API built with Express.js for managing user authentication and acquisitions. Uses Drizzle ORM with a Neon PostgreSQL (serverless) database.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js v5
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Zod
- **Logging:** Winston + Morgan
- **Security:** Helmet, CORS, cookie-parser

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Neon](https://neon.tech/) PostgreSQL database (or any PostgreSQL instance)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Prabhatvrma1/aquisitions.git
   cd aquisitions
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example env file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   ```env
   # Server config
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info

   # Database config
   DATABASE_URL=your_neon_database_url_here

   # JWT config
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Push the database schema**

   ```bash
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The server will start at `http://localhost:3000` with file-watching enabled.

## Project Structure

```
src/
├── index.js              # Entry point — loads dotenv and starts server
├── server.js             # HTTP server setup
├── app.js                # Express app configuration and middleware
├── config/
│   ├── database.js       # Neon + Drizzle database connection
│   └── logger.js         # Winston logger configuration
├── controllers/
│   └── auth.controler.js # Auth request handlers
├── middleware/            # Custom middleware (extensible)
├── models/
│   └── user.model.js     # Drizzle schema for users table
├── routes/
│   └── auht.routes.js    # Auth route definitions
├── services/
│   └── auth.service.js   # Auth business logic (hashing, user creation)
├── utils/
│   ├── cookies.js        # Cookie helper utilities
│   ├── format.js         # Validation error formatter
│   └── jwt.js            # JWT sign & verify helpers
└── validations/
    └── auth.validation.js # Zod schemas for signup/signin
```

## API Endpoints

### General

| Method | Endpoint  | Description              |
| ------ | --------- | ------------------------ |
| GET    | `/`       | Welcome message          |
| GET    | `/health` | Health check with uptime |
| GET    | `/api`    | API status               |

### Authentication (`/api/auth`)

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| POST   | `/api/auth/sign-up` | Register a new user |
| POST   | `/api/auth/sign-in` | Sign in (WIP)       |
| POST   | `/api/auth/sign-out`| Sign out (WIP)      |

#### Sign Up — `POST /api/auth/sign-up`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "user"
}
```

| Field      | Type   | Required | Notes                          |
| ---------- | ------ | -------- | ------------------------------ |
| `name`     | string | Yes      | 2–255 characters               |
| `email`    | string | Yes      | Valid email, max 255 chars     |
| `password` | string | Yes      | 6–126 characters               |
| `role`     | string | No       | `"user"` (default) or `"admin"` |

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## Available Scripts

| Script              | Command                   | Description                          |
| ------------------- | ------------------------- | ------------------------------------ |
| `npm run dev`       | `node --watch src/index.js` | Start dev server with file watching |
| `npm run lint`      | `eslint .`                | Run ESLint                           |
| `npm run lint:fix`  | `eslint . --fix`          | Auto-fix lint issues                 |
| `npm run format`    | `prettier --write .`      | Format code with Prettier            |
| `npm run format-check` | `prettier --check .`   | Check code formatting                |
| `npm run db:push`   | `drizzle-kit db:push`     | Push schema to database              |
| `npm run db:studio` | `drizzle-kit db:studio`   | Open Drizzle Studio GUI              |
| `npm run db:generate` | `drizzle-kit generate`  | Generate migration files             |
| `npm run db:migrate` | `drizzle-kit migrate`    | Run database migrations              |

## Logging

Logs are written to:

- `logs/error.log` — Error-level logs only
- `logs/combined.log` — All logs

In non-production environments, logs are also printed to the console with color formatting.

## License

ISC
