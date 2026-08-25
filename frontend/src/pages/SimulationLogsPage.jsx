import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Trash2, Play, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../components/common/Loader.jsx";
import Button from "../components/common/Button.jsx";
import { useSimulation } from "../hooks/useSimulation.js";
import { ALGORITHM_OPTIONS } from "../utils/algorithms.js";

const PAGE_SIZE = 10;

// "CREATED" isn't a real status color (no work has happened yet), so it
// stays neutral gray rather than inventing a "status-white" token.
const STATUS_STYLES = {
    COMPLETED: "text-status-green",
    RUNNING: "text-status-yellow",
    STOPPED: "text-status-red",
    FAILED: "text-status-red",
    CREATED: "text-text-dim",
};

function StatusDot({ status }) {
    const color = STATUS_STYLES[status] || "text-text-dim";
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm ${color}`}>
            <span className="capitalize">{status?.toLowerCase()}</span>
        </span>
    );
}

export default function SimulationLogsPage() {
    const navigate = useNavigate();
    const {
        simulations,
        fetchSimulations,
        removeSimulation,
        duplicateSimulation,
        loading,
        error,
        startSimulation,
    } = useSimulation();

    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [startError, setStartError] = useState(null);

    useEffect(() => {
        fetchSimulations();
    }, []);

    // jump back to page 1 whenever the search narrows/widens the result set
    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    function handleSelectSimulation(sim) {
        navigate(`/simulation-log/${sim.id}`, {
            state: { result_summary: sim.result_summary },
        });
    }

    async function handleStart(simId) {
        try {
            setStartError(null);
            await startSimulation(simId);
            navigate(`/simulation/${simId}`);
        } catch (err) {
            setStartError(err.message || "Failed to start simulation");
        }
    }

    const filteredSimulations = simulations.filter((sim) =>
        sim.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredSimulations.length / PAGE_SIZE));
    const pagedSimulations = filteredSimulations.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-lg font-semibold text-app-text">
                    Simulation Logs
                </h1>

                <div className="relative">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name"
                        className="w-56 rounded-lg border border-app-border bg-app-bg py-1.5 pl-8 pr-3 text-sm text-app-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-app-text/30"
                    />
                </div>
            </div>

            {startError && (
                <div className="text-sm text-status-red">{startError}</div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader size={20} />
                </div>
            ) : error ? (
                <div className="py-4 text-sm text-status-red">{error}</div>
            ) : simulations.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-dim">
                    No completed simulations
                </div>
            ) : filteredSimulations.length === 0 ? (
                <div className="py-12 text-center text-sm text-text-dim">
                    No simulations match "{searchTerm}"
                </div>
            ) : (
                <>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-app-border-soft text-left text-text-dim">
                                <th className="py-2 pr-4 font-medium">ID</th>
                                <th className="py-2 pr-4 font-medium">Name</th>
                                <th className="py-2 pr-4 font-medium">
                                    Algorithm
                                </th>
                                <th className="py-2 pr-4 font-medium">Status</th>
                                <th className="py-2 pr-4 font-medium">Created</th>
                                <th className="py-2 pr-4 text-right font-medium">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedSimulations.map((sim) => (
                                <tr
                                    key={sim.id}
                                    className="border-b border-app-border-soft/50 text-app-text"
                                >
                                    <td className="py-2.5 pr-4 text-text-dim">
                                        {String(sim.id).padStart(2, "0")}
                                    </td>
                                    <td
                                        className="cursor-pointer py-2.5 pr-4 hover:underline"
                                        onClick={() => handleSelectSimulation(sim)}
                                    >
                                        {sim.name}
                                    </td>
                                    <td className="py-2.5 pr-4 text-text-dim">
                                        {ALGORITHM_OPTIONS.find((a) => a.value === sim.algorithm)
                                            ?.label ?? "Unknown Algorithm"}
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <StatusDot status={sim.status} />
                                    </td>
                                    <td className="py-2.5 pr-4 text-text-dim">
                                        {sim.created_at
                                            ? `${new Date(`${sim.created_at}Z`).toLocaleDateString("en-IN", {
                                                  day: "2-digit",
                                                  month: "short",
                                                  timeZone: "Asia/Kolkata",
                                              })} ${new Date(`${sim.created_at}Z`).toLocaleTimeString("en-IN", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  timeZone: "Asia/Kolkata",
                                              })}`
                                            : "-"}
                                    </td>
                                    <td className="py-2.5 pr-4">
                                        <div className="flex justify-end gap-3 text-text-dim">
                                            {sim.status === "CREATED" && (
                                                <button
                                                    onClick={() => handleStart(sim.id)}
                                                    className="hover:text-purple-500"
                                                    title="Start Simulation"
                                                >
                                                    <Play size={15} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => duplicateSimulation(sim.id)}
                                                className="hover:text-app-text"
                                                title="Duplicate simulation"
                                            >
                                                <Copy size={15} />
                                            </button>
                                            <button
                                                onClick={() => removeSimulation(sim.id)}
                                                className="hover:text-accent"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between text-sm text-text-dim">
                            <span>
                                Showing {(page - 1) * PAGE_SIZE + 1}–
                                {Math.min(page * PAGE_SIZE, filteredSimulations.length)} of{" "}
                                {filteredSimulations.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="px-2.5 py-1.5"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <ChevronLeft size={14} />
                                </Button>
                                <span className="px-1 text-text-dim">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    className="px-2.5 py-1.5"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    <ChevronRight size={14} />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}