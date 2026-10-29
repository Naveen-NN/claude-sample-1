# Posts: REST API + React client

A monorepo (npm workspaces) with:

- **`server/`**: Express 5 + TypeScript REST API that proxies the fake `/posts` API at <https://jsonplaceholder.typicode.com>, with request validation (zod) and JSON error responses.
- **`client/`**: React 18 + Vite + TypeScript app that lists, views (with comments), creates, edits and deletes posts through the API.

> jsonplaceholder fakes writes: POST/PUT/PATCH/DELETE return realistic responses but nothing is saved. The client keeps your changes in memory until you reload the page.

## Getting started

Requires Node 20.12+.

```sh
npm install
npm run dev      # API on http://localhost:4000, client on http://localhost:5173
```

Other scripts: `npm test` (server tests), `npm run build` (build both).

Optional server config: copy `server/.env.example` to `server/.env`.

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ "status": "ok" }` |
| GET | `/api/posts?userId=&_page=&_limit=` | Total count in `X-Total-Count` header |
| GET | `/api/posts/:id` | 404 if not found |
| GET | `/api/posts/:id/comments` | |
| POST | `/api/posts` | Body `{ userId, title, body }` → 201 |
| PUT | `/api/posts/:id` | Full body |
| PATCH | `/api/posts/:id` | Partial body |
| DELETE | `/api/posts/:id` | 204 |
| GET | `/api/users?q=` | Optional `q` filters by name, username or email (case-insensitive, max 10 results) |
| GET | `/api/users/:id` | 404 if not found |

Invalid input returns `400` with zod `issues`. Upstream failures return `502`.
