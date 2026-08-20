# Expense Tracker — Backend

Express + MongoDB REST API providing account authentication and per-user sync
endpoints for the Expense Tracker mobile app. The mobile app remains **offline-first**:
AsyncStorage is always the source of truth on-device, and this backend is only
used to back up and sync data across devices when online.

## Tech Stack
- Express 4
- MongoDB via Mongoose
- JWT auth (`jsonwebtoken`) + password hashing (`bcryptjs`)
- `helmet`, `cors`, `express-rate-limit`, `express-validator` for baseline security hardening

## Project Structure
```
server/
├── src/
│   ├── app.js              # Express app assembly (middleware + routes)
│   ├── index.js             # Entry point: connects DB, starts HTTP server
│   ├── config/db.js         # Mongoose connection helper
│   ├── middleware/          # auth (JWT verification), validate, errorHandler
│   ├── models/              # User, Transaction, Budget, Goal (Mongoose schemas)
│   ├── controllers/         # Request handlers
│   └── routes/              # Route definitions per resource
├── test/api.test.js         # Integration tests (Node's built-in test runner)
├── .env.example
└── package.json
```

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `4000`) |
| `MONGODB_URI` | MongoDB connection string. For local dev, run MongoDB locally or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. |
| `JWT_SECRET` | Long random string used to sign JWTs. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | Set to `*` for development, or your app's origin in production |

### Run locally
```bash
npm run dev     # nodemon, auto-restarts on file changes
# or
npm start       # plain node
```

The API will be available at `http://localhost:4000`. Health check: `GET /health`.

### Run tests
```bash
npm test
```
Tests spin up a real, ephemeral MongoDB instance via `mongodb-memory-server` — no
external database or `.env` needed to run them.

## API Overview

All endpoints (except `/health`, `/api/auth/register`, `/api/auth/login`) require
an `Authorization: Bearer <token>` header.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/transactions` | List the authenticated user's transactions |
| POST | `/api/transactions/sync` | Push local transactions; upserts using **last-write-wins** (by `clientUpdatedAt`); returns the full authoritative list |
| GET | `/api/budgets` | Get the authenticated user's budget |
| POST | `/api/budgets/sync` | Push local budget; upserts using last-write-wins |
| GET | `/api/goals` | List the authenticated user's goals |
| POST | `/api/goals/sync` | Push local goals; upserts using last-write-wins |

### Sync model (kept intentionally simple)
Each local record carries a `clientId` (the same id generated on-device) and a
`clientUpdatedAt` timestamp. On sync, the server only overwrites a record if the
incoming `clientUpdatedAt` is strictly newer than what's stored — a straightforward
last-write-wins strategy with no merge/conflict UI. Receipt photos (local file URIs)
are **not** synced since they aren't portable off the device.

## Security notes
- Passwords are hashed with bcrypt (12 salt rounds) and never returned in API responses.
- `/api/auth/register` and `/api/auth/login` are rate-limited (20 requests / 15 min / IP)
  to reduce brute-force risk.
- All resource routes are scoped to `req.user.id` derived from the verified JWT —
  a user can never read or write another user's data.
- Input is validated with `express-validator` before hitting controllers.
- `helmet` sets baseline secure HTTP headers.

## Deploying to Render (free tier)

1. Push this repository (including the `server/` folder) to GitHub.
2. Create a free MongoDB Atlas cluster at https://www.mongodb.com/atlas — create a
   database user and copy the connection string (`mongodb+srv://...`).
3. Go to https://render.com → **New +** → **Web Service** → connect your GitHub repo.
4. Configure the service:
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment**, add the variables from `.env.example` (`MONGODB_URI` from
   step 2, a freshly generated `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CORS_ORIGIN=*`).
6. Click **Create Web Service**. Render will build and deploy automatically; note
   the public URL it gives you (e.g. `https://expense-tracker-api.onrender.com`).
7. In the mobile app, set that URL as `apiBaseUrl` in `app.json` → `expo.extra`
   (see the root README's Backend Integration section), rebuild/restart the app.

Free-tier Render services spin down after inactivity and take ~30–60s to wake on
the next request — the app's "Sync Status" indicator will show `syncing`/`offline`
during that cold start, which is expected on the free tier.

**Deployed and verified live:** https://expense-tracker-6v8l.onrender.com (register→login round
trip confirmed against the real MongoDB Atlas database, not just `/health`).

### Real gotchas hit during this deployment (both config-only, no code changes needed)
1. **Root Directory not actually applied** — if the deploy log shows an error about `expo`/`.ts`
   type-stripping (e.g. `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` on a file under
   `node_modules/expo/...`), Render is running from the **repo root** (the frontend project), not
   `server/`. Re-check the service's Root Directory field is exactly `server` and redeploy.
2. **Stale Start Command path after fixing #1** — if you see `Cannot find module
   '.../server/index.ts'`, the Start Command field has a leftover/wrong path (there is no
   `server/index.ts` — the real entry is `server/src/index.js`, plain CommonJS, no TypeScript, no
   build step). Once Root Directory is correctly `server`, the Start Command should just be
   `npm start` (no `server/` prefix) — Render already `cd`s into the Root Directory first.
