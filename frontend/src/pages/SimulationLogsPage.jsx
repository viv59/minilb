import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Trash2, Play } from "lucide-react";
import Loader from "../components/common/Loader.jsx";
import { useSimulation } from "../hooks/useSimulation.js";
import { ALGORITHM_OPTIONS } from "../utils/algorithms.js";

const STATUS_STYLES = {
    COMPLETED: "text-status-green",
    RUNNING: "text-status-yellow",
    STOPPED: "text-status-red",
    FAILED: "text-status-red",
    CREATED: "text-status-white",
};

function StatusDot({ status }) {
    const color = STATUS_STYLES[status] || "text-text-dim";
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm ${color}`}>
            {/* <span className="text-[8px]">●</span> */}
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

    useEffect(() => {
        fetchSimulations();
    }, []);

    function handleSelectSimulation(sim) {
        navigate(`/simulation-log/${sim.id}`, {
            state: { result_summary: sim.result_summary },
        });
    }

    async function handleStart(simId) {
        try {
            await startSimulation(simId);
            navigate(`/simulation/${simId}`);
        } catch (err) {
            setCreateError(err.message || "Failed to start simulation");
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-lg font-semibold text-text-primary">
                Simulation Logs
            </h1>

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
            ) : (
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border-primary text-left text-text-dim">
                            <th className="py-2 pr-4 font-medium">ID</th>
                            <th className="py-2 pr-4 font-medium">Name</th>
                            <th className="py-2 pr-4 font-medium">
                                Algorithm
                            </th>
                            <th className="py-2 pr-4 font-medium">Status</th>
                            <th className="py-2 pr-4 font-medium">Created</th>
                            <th className="py-2 pr-4 font-medium text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {simulations.map((sim) => (
                            <tr
                                key={sim.id}
                                className="border-b border-border-primary/50 text-text-primary"
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
                                    {/* {sim.algorithm} */}
                                    { ALGORITHM_OPTIONS.find(a => a.value === sim.algorithm)?.label ?? "Unknown Algorithm" }
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
                                        {
                                            sim.status === "CREATED" && (
                                            <button
                                                onClick={() => handleStart(sim.id)}
                                                className="hover:text-text-primary hover:text-blue-500"
                                                title="Start Simulation"
                                            >
                                                <Play size={15} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() =>
                                                duplicateSimulation(sim.id)
                                            }
                                            className="hover:text-text-primary hover:text-white"
                                            title="Duplicate simulation"
                                        >
                                            <Copy size={15} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                removeSimulation(sim.id)
                                            }
                                            className="hover:text-text-primary hover:text-red-500"
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
            )}
        </div>
    );
}