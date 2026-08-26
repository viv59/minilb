import { Activity, SlidersHorizontal, ShieldCheck, PlayCircle } from "lucide-react";

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
    // { label: "Overview", path: "/", icon: "LayoutDashboard" },
    { label: "Servers", path: "/servers", icon: "Server" },
    { label: "Simulations", path: "/simulations", icon: "Play" },
    { label: "Logs", path: "/simulation-logs", icon: "FileText" },
    { label: "Algorithms", path: "/algorithms", icon: "GitBranch" },
    { label: "Analytics", path: "/analytics", icon: "Activity", adminOnly: true },
    { label: "Settings", path: "/settings", icon: "Settings" },
];

export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const locationData = {
  "North America": {
    USA: [
      "US-East-1 (Virginia)",
      "US-East-2 (Ohio)",
      "US-West-1 (California)",
      "US-West-2 (Oregon)",
      "Central US (Texas)"
    ],
    Canada: [
      "Canada Central (Toronto)",
      "Canada East (Quebec)"
    ],
    Mexico: [
      "Mexico Central"
    ]
  },

  Europe: {
    Germany: [
      "Frankfurt",
      "Berlin"
    ],
    UK: [
      "London",
      "Manchester"
    ],
    France: [
      "Paris"
    ],
    Netherlands: [
      "Amsterdam"
    ]
  },

  Asia: {
    India: [
      "Mumbai",
      "Hyderabad",
      "Chennai",
      "Delhi"
    ],
    Singapore: [
      "Singapore-1",
      "Singapore-2"
    ],
    Japan: [
      "Tokyo",
      "Osaka"
    ],
    Korea: [
      "Seoul"
    ]
  },

  Australia: {
    Australia: [
      "Sydney",
      "Melbourne"
    ],
    NewZealand: [
      "Auckland"
    ]
  },

  SouthAmerica: {
    Brazil: [
      "Sao Paulo"
    ],
    Chile: [
      "Santiago"
    ]
  }
}

export const FEATURES = [
    {
        icon: Activity,
        title: "Live health monitoring",
        body: "Every server's state — healthy, in maintenance, or down — visible at a glance, color-coded the same way across the whole app.",
    },
    {
        icon: PlayCircle,
        title: "Run traffic before you ship it",
        body: "Simulate waves of requests against any algorithm and watch exactly how load would move, before it touches production.",
    },
    {
        icon: SlidersHorizontal,
        title: "Filter down to what matters",
        body: "Slice your fleet by any field and operator — region, status, tags — and apply it in seconds.",
    },
    {
        icon: ShieldCheck,
        title: "Role-aware by default",
        body: "Admins manage servers and algorithms. Everyone else gets the same clarity, read-only.",
    },
];