import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

export default function MainLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-app-bg text-app-text">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* <TopBar /> */}

                <main className="min-h-0 flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

                {/* <footer className="border-t border-app-border-soft py-2.5 text-center text-[11px] text-text-faint">
                    Made with 🧡 by Vivek Gaikwad
                </footer> */}

            </div>
        </div>
    );
}