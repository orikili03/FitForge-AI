## FitForge AI — Adaptive CrossFit WOD Engine

**FitForge AI** is a production-ready full-stack web app that generates personalized CrossFit-style workouts (WODs) based on user profile, equipment, time, goals, and recent history.

### Tech stack

- **Frontend**: React + TypeScript, Vite, React Router, React Query, React Hook Form, TailwindCSS, Recharts
- **Backend**: Node.js, Express, TypeScript, MongoDB (via Mongoose), Zod validation, JWT auth

### Backend: getting started

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure environment:

Create `.env` in `backend`:

```bash
MONGO_URI="mongodb://localhost:27017/fitforge"
JWT_SECRET="super-secret-jwt-key"
```

3. Run the API:

```bash
npm run dev
```

The API will be available on `http://localhost:4000`. The server will connect to MongoDB using `MONGO_URI` (or `mongodb://localhost:27017/fitforge` by default).

### Frontend: getting started

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run dev server:

```bash
npm run dev
```

The app will be available on the printed Vite URL (typically `http://localhost:5173`), with API calls proxied to the backend.

### Onboarding + Equipment

- **Sign up** is intentionally minimal: **Email, Password, Level**.
- Manage equipment in the dedicated **Equipment** tab:
  - Toggle equipment via a minimalist card grid (grouped by category).
  - Weight-dependent items reveal min/max range inputs with real-time validation.
  - Drag-and-drop to prioritize your go-to gear (order is persisted).
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
5. **Environment:** `MONGO_URI`, `JWT_SECRET` (and optionally `NODE_ENV=production`).

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

You can extend this base to integrate wearables or external fitness APIs by implementing new adapters in `backend/src/infrastructure/externalServices` and new domain agents in `backend/src/domain/services`.

