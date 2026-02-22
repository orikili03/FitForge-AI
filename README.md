## WODLab — Adaptive CrossFit WOD Engine

**WODLab** is a production-ready full-stack web app that generates personalized CrossFit-style workouts (WODs) based on user profile, equipment, time, goals, and recent history.

### Tech stack

- **Frontend**: React 18, TypeScript, Vite, React Router, TanStack Query, React Hook Form, TailwindCSS (design tokens in `src/design-system`)
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Zod validation, JWT auth, Groq (WOD generation only)

### Backend: getting started

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure environment:

Copy `backend/.env.template` to `backend/.env` and set values:

```bash
# backend/.env
MONGO_URI="mongodb://localhost:27017/wodlab"
JWT_SECRET="your-strong-secret-at-least-32-chars"
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama-3.3-70b-versatile"
```

- **MONGO_URI** — MongoDB connection. Local: `mongodb://localhost:27017/wodlab`. Cloud: use Atlas connection string.
- **JWT_SECRET** — Any long random string for signing tokens.
- **GROQ_API_KEY** — Used for LLM-based WOD generation. If unset (or `USE_GROQ=false`), the backend uses the deterministic Simple agent instead. Get a key from [Groq Console](https://console.groq.com/keys).
- **USE_GROQ** — Set to `false` to force the Simple (non-LLM) programming agent; useful for CI or offline.
- **GROQ_MODEL** — Optional; defaults to `llama-3.3-70b-versatile`. Other options: `llama-3.1-8b-instant`, etc.
- **WORKOUT_GENERATE_RATE_LIMIT_MAX** — Optional; max requests per minute for `POST /workouts/generate` per IP (default `10`).

3. Start MongoDB (if local):

```bash
# macOS/Linux: brew services start mongodb-community (or mongod)
# Windows: start MongoDB service or run mongod.exe
```

4. Run the API:

```bash
cd backend
npm run dev
```

The API runs at **http://localhost:4000**. You should see: `Connected to MongoDB`, `WODLab backend listening on port 4000`.

### Frontend: getting started

1. Install dependencies:

```bash
cd frontend
npm install
```

2. (Optional) API URL for development:

- **Using Vite dev server (recommended):** Leave `frontend/.env` without `VITE_API_BASE_URL` (or leave it empty). Vite will proxy `/auth`, `/users`, `/workouts`, `/analytics` to `http://localhost:4000`.
- **If proxy doesn’t work:** Create `frontend/.env` with:
  ```bash
  VITE_API_BASE_URL=http://localhost:4000
  ```
  Then the app will call the backend at that URL directly (CORS is enabled on the backend).

3. Run the frontend:

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). Use the app from that origin so the proxy or `VITE_API_BASE_URL` points to the same backend you started.

### Troubleshooting: "Network Error" when generating a WOD

1. **Backend must be running** — In a terminal: `cd backend && npm run dev`. You must see `WODLab backend listening on port 4000`. If it exits, check `.env` (e.g. missing `GROQ_API_KEY` or invalid `MONGO_URI`).
2. **Call the app from the Vite dev URL** — Open http://localhost:5173 (or the URL Vite shows). Don’t open the built `dist/index.html` from the file system; that won’t hit the proxy.
3. **If you set `VITE_API_BASE_URL`** — It must match the backend (e.g. `http://localhost:4000`). No trailing slash. Restart the frontend after changing `.env`.
4. **Check backend health** — In the browser or with curl: `http://localhost:4000/health` should return `{"status":"ok"}`. If that fails, the backend isn’t reachable.

### Onboarding + Equipment

- **Sign up** is intentionally minimal: **Email, Password, Level**.
- Manage equipment in the dedicated **Equipment** tab:
  - Toggle equipment via a minimalist card grid (grouped by category).
  - Weight-dependent items reveal min/max range inputs with real-time validation.
  - Use one-tap presets (Travel, Home/Garage, Full Box) and save custom presets.

### Core API endpoints

- `POST /auth/register`

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "athlete@example.com",
    "password": "Password123!",
    "fitnessLevel": "intermediate",
    "goals": ["strength", "engine"],
    "equipmentAccess": ["barbell", "rower"],
    "movementConstraints": [],
    "injuryFlags": []
  }'
```

- `POST /auth/login`
- `GET /users/me`
- `PUT /users/me`
- `POST /workouts/generate`
- `GET /workouts/history`
- `POST /workouts/complete`
- `GET /analytics/progress`

All authenticated routes expect `Authorization: Bearer <token>` from the login/register response.

### Architecture

- **Backend**: Clean layers — `composition.ts` builds repos, engine, and routers; see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture, request flow, and quick wins (JSON strip, analytics use case, rate limiting, env-based ProgrammingAgent).
- **Knowledge / RAG**: Static markdown in `backend/src/domain/knowledge/` is not yet wired into prompts; RAG can be added later to inject retrieved chunks into the LLM prompt.

### Workout engine

The workout engine is implemented as a domain service (`WorkoutEngine`) that composes four stateless agents:

- `AssessmentAgent` — estimates fatigue and movement competency from user + recent workouts
- `ConstraintAgent` — constrains movements based on equipment and injury/mobility flags
- `ProgressionAgent` — adjusts target intensity and duration from history
- `ProgrammingAgent` — builds the actual WOD spec (warm-up, main piece, scaling, finisher, intensity guidance)

These agents are defined as interfaces in the domain layer and wired to a simple initial implementation, making it easy to plug in future AI-powered agents or external services.

### Testing

- Backend unit tests can be added under `backend/tests` to cover the workout engine and agents.
- API integration tests can be written with Jest + Supertest targeting the Express app exported from `src/server.ts`.

### Deploy to Render (Option A: separate frontend + backend)

**Backend (API)**

1. Create a **Web Service**, connect your repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm start`
5. **Environment:** `MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY` (and optionally `GROQ_MODEL`, `NODE_ENV=production`).

Note the backend URL (e.g. `https://your-api.onrender.com`).

**Frontend (static site)**

1. Create a **Static Site** (or **Web Service** with a static build), connect the same repo.
2. **Root Directory:** `frontend`
3. **Build Command:** `npm install && npm run build`
4. **Publish directory:** `dist` (for Static Site) or configure your server to serve `dist`.
5. **Environment:** add `VITE_API_BASE_URL` = your backend URL (e.g. `https://your-api.onrender.com`).  
   Vite bakes this into the build, so the frontend will call your API at that URL.

Open the frontend URL in the browser for the app UI; the backend URL is for the API only.

### Dockerization (ready)

The separation of backend and frontend plus environment-based configuration makes it straightforward to add:

- A backend Dockerfile that builds the TypeScript server and connects to MongoDB
- A frontend Dockerfile that builds the Vite bundle and serves via a static server
- A `docker-compose.yml` wiring MongoDB + backend + frontend

You can extend this base to integrate wearables or external fitness APIs by implementing new adapters in `backend/src/infrastructure` and new domain agents in `backend/src/domain/services`.

---

### Codebase overview

- **Frontend**: `src/app` (routes, layout), `src/pages` (screens), `src/components` (ui, wod, timer, layout), `src/features` (API hooks + domain data), `src/contexts`, `src/services`, `src/design-system`.
- **Backend**: Clean layers — `composition.ts` wires everything; `interfaces` (route factories, controllers, validators, middleware), `application` (use cases, DTOs), `domain` (entities, repositories, services, config), `infrastructure` (Mongoose repos, database, Groq client). WOD generation uses `WorkoutEngine` with either Groq or the deterministic Simple programming agent (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)).
- **Security**: Complete-workout endpoint validates that the workout belongs to the authenticated user. Auth token key is centralized in `frontend/src/utils/authToken.ts` (`AUTH_STORAGE_KEY`).

### Suggested next steps

- **Testing**: Add more unit tests for domain (stimulus, pattern balance, Zod WorkoutSpec); keep integration tests for auth and workout flows.
- **Frontend deps**: Remove or use `recharts` and `@dnd-kit/*` (currently unused). Add charts to the Analytics page if keeping Recharts; implement equipment reorder if keeping dnd-kit.
- **Error typing**: Replace `any` in backend error handling with a small `ApiError` type (e.g. `statusCode` + `message`) for clearer error handling.
- **RAG**: Wire `domain/knowledge/*.md` into retrieval and inject 1–3 chunks into the programming prompt for consistent methodology and examples.

