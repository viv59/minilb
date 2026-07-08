export const initialServers = [
    {
        id: "srv_001",
        name: "Server 1",
        status: "Healthy",
        ip: "172.18.0.5",
        port: 8001,
        cpu: 23,
        memory: 41,
        reqMin: 342,
        uptime: "2h 45m 12s",
        created: "May 20, 2024 10:30 AM",
    },
    {
        id: "srv_002",
        name: "Server 2",
        status: "Healthy",
        ip: "172.18.0.6",
        port: 8002,
        cpu: 31,
        memory: 48,
        reqMin: 298,
        uptime: "2h 40m 03s",
        created: "May 20, 2024 10:31 AM",
    },
    {
        id: "srv_003",
        name: "Server 3",
        status: "Healthy",
        ip: "172.18.0.7",
        port: 8003,
        cpu: 28,
        memory: 36,
        reqMin: 301,
        uptime: "2h 38m 51s",
        created: "May 20, 2024 10:32 AM",
    },
    {
        id: "srv_004",
        name: "Server 4",
        status: "Healthy",
        ip: "172.18.0.8",
        port: 8004,
        cpu: 26,
        memory: 39,
        reqMin: 304,
        uptime: "2h 33m 20s",
        created: "May 20, 2024 10:33 AM",
    },
];

export const DONUT_COLORS = [
    "#7c5cff",
    "#4fd1ff",
    "#34d399",
    "#a78bfa",
    "#f472b6",
    "#fb923c",
];

// Icon name must match a key exported from lucide-react - see Sidebar.jsx's ICONS map.
export const NAV_ITEMS = [
    { label: "Overview", path: "/", icon: "LayoutDashboard" },
    { label: "Servers", path: "/servers", icon: "Server" },
    { label: "Simulations", path: "/simulations", icon: "Play" },
    { label: "Logs", path: "/simulation-logs", icon: "FileText" },
    { label: "Algorithms", path: "/algorithms", icon: "GitBranch" },
    { label: "Analytics", path: "/analytics", icon: "Activity" },
    { label: "Settings", path: "/settings", icon: "Settings" },
];

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
