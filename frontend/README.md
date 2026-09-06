# minilb frontend

This is the React + Vite dashboard for the mini load balancer application. It is built around a protected auth flow, server inventory management, analytics, and simulation tooling.

## Overview

- SPA built with React 18 and Vite.
- Uses React Router for navigation and Zustand for state management.
- Tailwind CSS provides the styling system.
- Axios handles backend calls, while Zustand stores keep session and feature state in sync.
- The app supports a public landing page, login/register flow, protected dashboard routes, and simulation pages.

## Project structure

- `src/main.jsx` — app bootstrap, root mount, and global CSS import.
- `src/App.jsx` — application shell with auth initialization, theme provider, and router provider.
- `src/routes.jsx` — route configuration for public + protected pages.
- `src/context/ThemeContext.jsx` — light/dark theme toggle and persistence.
- `src/context/ServerContext.jsx` — UI modal and server selection helpers.
- `src/store/authStore.js` — persisted auth token and user session.
- `src/store/serverStore.js` — server list, filters, and server actions.
- `src/store/simulationStore.js` — simulation state management.
- `src/store/settingsStore.js` — theme and default algorithm preferences.
- `src/hooks/useServers.js`, `useSimulation.js`, `useStatistics.js`, `useTraffic.js` — convenience hooks.
- `src/api/authApi.js` — login/register/user endpoints.
- `src/api/serverApi.js` — server list/create/update/filter API wrappers.
- `src/api/simulationApi.js` — simulation CRUD and lifecycle endpoints.
- `src/api/statisticsApi.js` — dashboard stat requests.
- `src/utils/constants.js` — app constants and API base URL.
- `src/utils/algorithms.js` — algorithm metadata shown in the UI.

## Route map

The app uses `createBrowserRouter` and a protected layout route.

Public routes:

- `/` — `LandingPage`
- `/login` — `Login`
- `/register` — `Register`

Protected routes:

- `/dashboard` — `Dashboard`
- `/servers` — `Servers`
- `/algorithms` — `Algorithms`
- `/algorithms/:algoValue` — `AlgorithmDetail`
- `/analytics` — `Analytics`
- `/settings` — `Settings`
- `/simulations` — `Simulations`
- `/simulation/:simId` — `RunningSimulation`
- `/simulation-logs` — `SimulationLogsPage`
- `/simulation-log/:simId` — `SimulationLog`

A catch-all route renders `NotFound` for unknown paths.

## Auth flow

The frontend persists only the JWT token in local storage and re-validates it on load:

- `useAuthStore.initialize()` checks the saved token against `/auth/me`.
- If validation fails, the app clears the stored token and user.
- `ProtectedRoute` blocks access to protected pages until the session is valid.

## Server management

The frontend fetches and updates server data with the Zustand store:

- `fetchServers()` loads the list from `/servers/`.
- `addServer()` posts to `/servers/` and appends the created server.
- `updateServer()` updates an existing server.
- `removeServer()` deletes a server record.
- `applyFilters()` and `fetchFilterFields()` support dynamic filtering based on backend metadata.

## Simulation flow

The simulation UI lets users:

- create a named simulation with a chosen algorithm and traffic wave definition,
- start it through the backend,
- watch progress in a dedicated running page,
- view stored logs and duplicate existing runs.

The relevant API client is in `src/api/simulationApi.js` and the simulation page state is managed via `useSimulation()`.

## Environment and config

The frontend expects the backend to be available at:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If that variable is missing, the Axios client falls back to:

```bash
http://127.0.0.1:8000
```

## Install and run

From the frontend directory:

```bash
npm install
npm run dev
```

Then open the app in the browser using the local Vite URL, usually:

```bash
http://localhost:5173
```

## Build

```bash
npm run build
```

This creates a production build in the `dist/` folder.

## Styling and UI notes

- Tailwind CSS is configured through `tailwind.config.js` and Vite.
- Global styles live under `src/styles/`.
- `ThemeContext` toggles dark/light mode by updating the HTML root class.
- Shared UI primitives such as `Card`, `Button`, `Modal`, and `Loader` are reused across pages.

## Data contracts

The client normalizes backend responses in `src/api/serverApi.js` before using them in the UI. This keeps the front-end tolerant of small server payload variations while still exposing a consistent shape to components.

## Notes

- Authentication is required for most of the app; the landing page is the only public entry point.
- The algorithm selection is represented in the frontend state and UI, but the actual load-balancing behavior is enforced by the backend runtime and simulation engine.
- Most application state is kept in Zustand stores, while UI-only state such as modal visibility is managed through `ServerContext`.
