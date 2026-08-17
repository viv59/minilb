import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Server,
    GitBranch,
    Activity,
    Settings as SettingsIcon,
    Hexagon,
    Play,
    FileText,
    LogOut,
} from "lucide-react";
import { NAV_ITEMS } from "../../utils/constants.js";
import { useAuthStore } from "../../store/authStore.js";

const ICONS = {
    LayoutDashboard,
    Server,
    GitBranch,
    Activity,
    Settings: SettingsIcon,
    Play,
    FileText,
};

export default function Sidebar() {
    const isAdmin = useAuthStore((s) => s.isAdmin());
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const visibleNavItems = NAV_ITEMS.filter(
        (item) => !item.adminOnly || isAdmin
    );

    const initials = user?.name
        ? user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "?";

    return (
        <aside className="flex h-screen w-56 flex-shrink-0 flex-col border-r border-app-border-soft p-3.5">
            
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center gap-2.5 px-2 pb-5 pt-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-text">
                    <Hexagon size={16} className="text-black" />
                </div>

                <span className="text-sm font-semibold font-mono tracking-tight">
                    miniLB
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
                {visibleNavItems.map((item) => {
                    const Icon = ICONS[item.icon];

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
                                    isActive
                                        ? "border border-app-border bg-white/5 text-app-text"
                                        : "text-text-dim hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={16} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Profile */}
            <div className="mt-3 flex-shrink-0 rounded-xl border border-app-border-soft bg-app-panel p-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-app-border-soft bg-app-panel-soft text-xs font-bold text-text-dim">
                        {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-app-text">
                            {user?.name ?? "Unknown"}
                        </div>

                        <div className="truncate text-[11px] text-text-faint">
                            {user?.email}
                        </div>
                    </div>
                </div>

                {user?.role && (
                    <div className="mt-2 text-[10px] uppercase tracking-wide text-text-faint">
                        {user.role}
                    </div>
                )}

                <button
                    onClick={logout}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-app-border py-1.5 text-xs text-text-dim hover:border-text-dim hover:text-app-text"
                >
                    <LogOut size={13} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}