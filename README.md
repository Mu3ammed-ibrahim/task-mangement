# Task Management REST API

A REST API for user registration and login and for managing tasks owned by the authenticated user. It uses Node.js ES modules, Express 5, PostgreSQL (`pg`), bcrypt password hashing, and JWT bearer authentication.

## Prerequisites

- Node.js 20 or newer
- PostgreSQL with separate development and test databases
- npm

## Installation

```sh
npm install
```

Create a local `.env` file with your own values (do not commit secrets):

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=task_mangement
JWT_SECRET=replace_with_a_long_random_secret
```

The development database name is intentionally `task_mangement`. The test configuration ignores `DB_NAME` and selects the dedicated database `task_management_test` whenever `NODE_ENV=test`. Set the host, port, user, and password to credentials that can connect to both databases. The test suites check the connected database name before making any test requests and fail instead of running against another database.

The API expects the PostgreSQL `users` and `tasks` tables to exist with the columns used by the services. Schema creation and migrations are not included in this repository; provision both databases with the application schema before running the API or tests.

## Run the application

```sh
npm run dev
```

Or run the server without the development watcher:

```sh
npm start
```

The server listens on `PORT`, defaulting to `3000`.

## Automated tests

```sh
npm test
```

The test command sets `NODE_ENV=test` and runs Vitest. Tests create users with unique email addresses, create tasks through the API, and clean up only those users and their tasks. They do not truncate tables or alter the development database.

## Authentication

Register with `POST /users/register`, then log in with `POST /users/login`. Use the returned token on protected routes:

```http
Authorization: Bearer <token>
```

Registration example:

```sh
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Example","email":"alex@example.test","password":"correct-horse"}'
```

Expected status: `201 Created`. The response contains the created user identifiers and role; it does not contain the password hash.

Login example:

```sh
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.test","password":"correct-horse"}'
```

Expected status: `200 OK`, with a JWT in the `token` property. Invalid credentials return `401 Unauthorized`.

Create a task with the token:

```sh
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Prepare release","description":"Review the release checklist","status":"pending","priority":"medium","due_date":"2030-01-15"}'
```

Expected status: `201 Created`. Task reads and changes are restricted to the authenticated user's tasks.

## Endpoints

| Method | Path | Authentication | Description | Main success response |
|---|---|---|---|---|
| `POST` | `/users/register` | No | Register a user | `201` |
| `POST` | `/users/login` | No | Obtain a JWT | `200` |
| `GET` | `/users` | Bearer token | List users | `200` |
| `GET` | `/users/:id` | Bearer token | Get a user | `200`, `404` if absent |
| `PUT` | `/users/:id` | Bearer token; own ID only | Update name and email | `200`, `403`, `404` |
| `DELETE` | `/users/:id` | Bearer token; own ID only | Delete a user | `204`, `403`, `404` |
| `GET` | `/tasks` | Bearer token | List the current user's tasks | `200` |
| `GET` | `/tasks/:id` | Bearer token | Get an owned task | `200`, `400` for malformed ID, `404` if absent/not owned |
| `POST` | `/tasks` | Bearer token | Create a task | `201` |
| `PUT` | `/tasks/:id` | Bearer token | Replace task fields | `200`, `400`, `404` |
| `PATCH` | `/tasks/:id` | Bearer token | Partially update a task | `200`, `400`, `404` |
| `DELETE` | `/tasks/:id` | Bearer token | Delete an owned task | `204`, `400` for malformed ID, `404` if absent/not owned |

Task fields include `title` (required for create and replace), `description`, `status` (`pending`, `in_progress`, or `completed`), `priority` (`low`, `medium`, or `high`), and `due_date` (`YYYY-MM-DD`). Replace requests require `title`, `status`, and `priority`. Malformed input returns `400`; invalid or missing authentication returns `401`. Task list responses include pagination metadata and a `tasks` array. List filtering, sorting, and pagination are available through the `status`, `priority`, `search`, `sort`, `order`, `page`, and `limit` query parameters.

## Known limitations

- This repository does not include schema migrations or database provisioning.
- Authenticated users can list and read user records; only user updates and deletion enforce that the requested user ID matches the token.
- Registration requires a non-empty name and email and a password of at least eight characters, but does not validate email address syntax.
- Error responses for unexpected server/database failures use a generic `500` message.
