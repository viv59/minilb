import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Servers from "./pages/Servers.jsx";
import Algorithms from "./pages/Algorithms.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Simulations from "./pages/Simulations.jsx";
import RunningSimulation from "./pages/RunningSimulation.jsx";
import SimulationLogsPage from "./pages/SimulationLogsPage.jsx";
import SimulationLog from "./pages/SimulationLog.jsx"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "servers", element: <Servers /> },
            { path: "algorithms", element: <Algorithms /> },
            { path: "analytics", element: <Analytics /> },
            { path: "settings", element: <Settings /> },
            { path: "simulations", element: <Simulations /> },
            { path: "simulation/:simId", element: <RunningSimulation /> },
            { path: "simulation-logs", element: <SimulationLogsPage /> },
            { path: "simulation-log/:simId", element: <SimulationLog />  }
        ],
    },
]);
