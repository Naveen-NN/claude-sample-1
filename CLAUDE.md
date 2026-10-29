# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

npm workspaces monorepo (`server/` Express 5 API, `client/` React + Vite). Run commands from the repo root.

## Commands

- `npm run dev` — server on :4000 + client on :5173; Vite proxies `/api` to :4000, so the client needs the server running.
- `npm run build` — the **only typecheck** in the repo (`tsc` in both workspaces). `server/tests/` is outside the server tsconfig, so test files are never typechecked.
- `npm test` — server vitest only; the client has no tests.
- Single test: `npm test -w server -- tests/posts.test.ts` or `npm test -w server -- -t "test name"`.
- No linter/formatter configured. Match existing style: double quotes, semicolons, 2-space indent.

## Server gotchas

- Server uses `NodeNext` resolution: relative imports must end in `.js` (also in tests). Client imports take no extension.
- The server proxies https://jsonplaceholder.typicode.com. Writes (POST/PUT/PATCH/DELETE) return realistic responses but persist nothing — don't debug "lost" data.
- Tests are network-free: `server/tests/posts.test.ts` replaces every export of `src/services/jsonPlaceholder.ts` with `vi.fn()` via `vi.mock`. When adding a new export there, add it to that mock factory or it is `undefined` in tests.
- `createApp()` (`src/app.ts`) builds the app without listening so supertest can use it; only `src/index.ts` calls `listen`. Keep it that way.
- Route handlers just throw (e.g. zod `.parse`) and rely on Express 5 async error propagation — no try/catch or asyncHandler. Status mapping lives in `src/middleware/errorHandler.ts`.
- Env vars are optional (defaults in `server/src/config.ts`); see `server/.env.example`.

## Conventions

- `server/src/types.ts` and `client/src/types.ts` are intentionally separate copies. Don't consolidate them into a shared package.
- Work on a feature branch and open a PR; never commit directly to `main`.
- Propose a plan before making non-trivial changes.
