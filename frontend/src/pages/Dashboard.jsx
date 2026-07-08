import LiveTrafficCard from "../components/dashboard/LiveTrafficCard.jsx";
import ServerStats from "../components/dashboard/ServerStats.jsx";
import TrafficDonut from "../components/dashboard/TrafficDonut.jsx";
import NetworkDiagram from "../components/network/NetworkDiagram.jsx";
import Loader from "../components/common/Loader.jsx";
import { useServers } from "../hooks/useServers.js";

export default function Dashboard() {
    const { loading, error, servers, fetchServers } = useServers();

    if (loading && servers.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-text-dim">
                <Loader size={28} />
                <span className="text-sm">Loading servers from backend…</span>
            </div>
        );
    }

    if (error && servers.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-status-red">
                <span className="text-sm">
                    Couldn't reach the backend: {error}
                </span>
                <button
                    onClick={fetchServers}
                    className="text-xs text-accent2 hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <LiveTrafficCard />
            {/* <ServerStats />
            <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
                <TrafficDonut />
                <NetworkDiagram />
            </div> */}
        </div>
    );
}
