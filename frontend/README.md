# Frontend Overview

This frontend is a Vite + React application for the mini load balancer dashboard.
It uses React Router v6, Zustand for state management, Tailwind CSS for styling, and Axios for backend API calls.

## Project structure

- `src/main.jsx`
  - App entrypoint. Renders `<App />` inside `React.StrictMode` and imports global CSS.

- `src/App.jsx`
  - Root application component.
  - Fetches servers on mount by calling `useServerStore.getState().fetchServers()`.
  - Wraps the app with `ThemeProvider` and `ServerUIProvider`.
  - Renders `RouterProvider` with the app routes.

- `src/routes.jsx`
  - Defines the client-side routes using `createBrowserRouter`.
  - Uses `MainLayout` as the layout wrapper.
  - Routes:
    - `/` → `Dashboard`
    - `/servers` → `Servers`
    - `/algorithms` → `Algorithms`
    - `/analytics` → `Analytics`
    - `/settings` → `Settings`

- `src/context/ThemeContext.jsx`
  - Manages theme state (`dark` / `light`).
  - Persists theme selection to `localStorage`.
  - Updates the `document.documentElement` className for theme toggling.
  - Provides `useTheme()` hook.

- `src/context/ServerContext.jsx`
  - Manages UI-specific server state such as the selected server and open modal.
  - Tracks `selectedId` and `modal` state for add/edit dialogs.
  - Provides helpers like `openAddModal()`, `openEditModal()`, and `closeModal()`.
  - Provides `useServerUI()` hook.

- `src/store/serverStore.js`
  - Uses Zustand to manage server state.
  - Holds server list, loading/error flags, and active algorithm index.
  - Provides actions:
    - `fetchServers()` → loads server list from backend.
    - `addServer(payload)` → creates a new server and updates local state.
    - `updateServer(id, patch)` → updates a server and updates local state.
    - `removeServer(id)` → deletes a server and updates local state.
    - `cycleAlgorithm()` → rotate algorithm index.
    - `setAlgorithmIndex(index)` → set selected algorithm.

- `src/hooks/useServers.js`
  - Small hook to expose server store state/actions.
  - Used by pages and components to access server data cleanly.

- `src/api/axios.js`
  - Configures Axios with a base URL from `VITE_API_BASE_URL` or `http://127.0.0.1:8000`.
  - Adds a response interceptor for centralized API error logging.

- `src/api/serverApi.js`
  - Wraps backend server API requests.
  - Normalizes backend response shape into fields used by the UI.
  - Provides built-in methods for list/create/get/update/remove.

- `src/utils/constants.js`
  - Defines navigation items and icons used by the sidebar.
  - Defines `API_BASE_URL`.

- `src/utils/algorithms.js`
  - Defines available load balancing algorithms and descriptions.
  - Includes a small demo helper `pickRoundRobin()`.

## Layout and app shell

- `src/components/layout/MainLayout.jsx`
  - App shell containing the `Sidebar`, `TopBar`, and main content area.
  - Uses `<Outlet />` to render the current route content.

- `src/components/layout/Sidebar.jsx`
  - Application navigation panel.
  - Renders links for the app pages.
  - Shows the currently selected load balancing algorithm and a button to change it.

- `src/components/layout/TopBar.jsx`
  - Header bar with system status and a placeholder avatar.
  - Contains a commented-out add-server button.

## Pages

- `src/pages/Dashboard.jsx`
  - Main overview page.
  - Loads server state with `useServers()`.
  - Renders the `NetworkDiagram` and optionally other widgets.
  - Shows a loading or error message if server data is not available.

- `src/pages/Servers.jsx`
  - Renders a list of `ServerCard` components.
  - Includes `AddServerModal` and `EditServerModal` for server CRUD.

- `src/pages/Algorithms.jsx`
  - Displays algorithm cards based on `ALGORITHMS`.
  - Uses `useServerStore()` to read and update the active algorithm.

- `src/pages/Analytics.jsx`
  - Renders analytics widgets like `TrafficDonut` and `HealthSummary`.
  - Uses `useTraffic()` hook to compute traffic distribution.

- `src/pages/Settings.jsx`
  - Provides appearance settings.
  - Uses `useTheme()` to toggle dark/light mode.

## Shared UI components

- `src/components/common/Card.jsx`
  - Generic card wrapper used throughout the UI.

- `src/components/common/Button.jsx`
  - Button component with style variants.

- `src/components/common/Modal.jsx`
  - Modal dialog wrapper used by add/edit server forms.

- `src/components/common/Loader.jsx`
  - Loading spinner used on the Dashboard.

## Server management components

- `src/components/servers/ServerCard.jsx`
  - Displays server details and action buttons.
  - Used by the `/servers` page.

- `src/components/servers/AddServerModal.jsx`
  - Modal form for adding a new server.
  - Calls `addServer()` from the shared server store.
  - Uses `ServerUIContext` to open/close and manage modal state.

- `src/components/servers/EditServerModal.jsx`
  - Modal form for editing an existing server.
  - Pre-fills values from the selected server.
  - Calls `updateServer()` from the shared server store.

## Styles

- `src/styles/globals.css`
  - Global CSS imports and base styling.

- `src/styles/variables.css`
  - CSS custom properties used by Tailwind and the app.

- `src/styles/animations.css`
  - Animation utilities for UI elements.

## Running the frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start local dev server:

```bash
npm run dev
```

3. Open the app in the browser.

## Notes

- The frontend is primarily a dashboard shell connected to a FastAPI backend.
- Data is fetched from the backend using Axios and stored in Zustand.
- UI state (modal visibility, selected server) is managed with React context.
- Routing is handled by React Router and `MainLayout` provides the shared frame.
- The `Algorithms` page updates the selected algorithm state, but a real load-balancing implementation must be enforced by the backend.
