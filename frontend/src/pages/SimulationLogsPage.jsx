import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash2, RefreshCw } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import Loader from "../components/common/Loader.jsx";
import { simulationApi } from "../api/simulationApi.js";

export default function SimulationLogsPage() {
    const navigate = useNavigate();
    const [simulations, setSimulations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedSim, setSelectedSim] = useState(null);
    const [logs, setLogs] = useState("");
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState(null);

    useEffect(() => {
        fetchSimulations();
    }, []);

    async function fetchSimulations() {
        setLoading(true);
        setError(null);
        try {
            const data = await simulationApi.list();
            // Filter to show only completed, stopped, or failed simulations
            const completedSims = data.filter(
                (s) =>
                    s.status === "COMPLETED" ||
                    s.status === "STOPPED" ||
                    s.status === "FAILED",
            );
            setSimulations(completedSims);
        } catch (err) {
            setError(err.message || "Failed to load simulations");
        } finally {
            setLoading(false);
        }
    }

    async function handleSelectSimulation(sim) {
        setSelectedSim(sim);
        setLogs("");
        setLogsError(null);
        fetchSimulationLogs(sim.id);
    }

    async function fetchSimulationLogs(simId) {
        setLogsLoading(true);
        setLogsError(null);
        try {
            const response = await simulationApi.getLogs(simId);
            setLogs(response.logs || "");
        } catch (err) {
            setLogsError(
                "Failed to fetch logs: " + (err.message || "Unknown error"),
            );
            setLogs("");
        } finally {
            setLogsLoading(false);
        }
    }

    async function handleDeleteLogs(simId) {
        if (!confirm("Are you sure you want to delete these logs?")) {
            return;
        }

        setLogsLoading(true);
        try {
            await simulationApi.deleteLogs(simId);
            setLogs("");
            setSelectedSim(null);
            await fetchSimulations();
        } catch (err) {
            setLogsError(
                "Failed to delete logs: " + (err.message || "Unknown error"),
            );
        } finally {
            setLogsLoading(false);
        }
    }

    const downloadLogs = (simId) => {
        if (!logs) {
            setLogsError("No logs to download");
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([logs], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `simulation_${simId}_logs.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                {/* <Button
                    onClick={() => navigate("/simulations")}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </Button> */}
                <h1 className="text-lg font-semibold">Simulation Logs</h1>
            </div>

            <div className="grid grid-cols-3 gap-6 max-[1200px]:grid-cols-1">
                {/* Simulations List */}
                <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6 col-span-1">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-text-primary">
                            Completed Simulations
                        </h2>
                        <Button
                            onClick={fetchSimulations}
                            variant="secondary"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader size={24} />
                        </div>
                    ) : error ? (
                        <div className="p-3 bg-status-red/10 border border-status-red/30 rounded text-status-red text-sm">
                            {error}
                        </div>
                    ) : simulations.length === 0 ? (
                        <div className="text-center py-8 text-text-dim text-sm">
                            No completed simulations
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {simulations.map((sim) => (
                                <button
                                    key={sim.id}
                                    onClick={() => handleSelectSimulation(sim)}
                                    className={`w-full text-left p-3 rounded-lg border transition ${
                                        selectedSim?.id === sim.id
                                            ? "border-accent1 bg-accent1/10"
                                            : "border-border-primary hover:border-accent1/50 bg-bg-primary"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">
                                                {sim.id} - {sim.name}
                                            </p>
                                            <p className="text-xs text-text-dim">
                                                {sim.algorithm}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                sim.status === "COMPLETED"
                                                    ? "bg-status-green/20 text-status-green"
                                                    : sim.status === "STOPPED"
                                                      ? "bg-status-red/20 text-status-red"
                                                      : "bg-status-yellow/20 text-status-yellow"
                                            }`}
                                        >
                                            {sim.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Logs Viewer */}
                <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6 col-span-2">
                    {selectedSim ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-text-primary">
                                    Logs: {selectedSim.name}
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() =>
                                            fetchSimulationLogs(selectedSim.id)
                                        }
                                        disabled={logsLoading}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            downloadLogs(selectedSim.id)
                                        }
                                        disabled={logsLoading || !logs}
                                        variant="secondary"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Download size={16} />
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            handleDeleteLogs(selectedSim.id)
                                        }
                                        disabled={logsLoading || !logs}
                                        variant="danger"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            {logsError && (
                                <div className="mb-4 p-3 bg-status-red/10 border border-status-red/30 rounded text-status-red text-sm">
                                    {logsError}
                                </div>
                            )}

                            <div className="bg-bg-primary border border-border-primary rounded p-4 h-96 overflow-auto font-mono text-sm">
                                {logsLoading ? (
                                    <div className="text-text-dim text-center py-8">
                                        Loading logs...
                                    </div>
                                ) : logs ? (
                                    <pre className="text-text-primary whitespace-pre-wrap break-words">
                                        {logs}
                                    </pre>
                                ) : (
                                    <div className="text-text-dim text-center py-8">
                                        No logs available
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            {selectedSim.result_summary && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-bg-primary rounded border border-border-primary">
                                        <p className="text-xs text-text-dim mb-1">
                                            Total Requests
                                        </p>
                                        <p className="text-lg font-bold text-accent1">
                                            {
                                                selectedSim.result_summary
                                                    .total_requests
                                            }
                                        </p>
                                    </div>
                                    <div className="p-3 bg-bg-primary rounded border border-border-primary">
                                        <p className="text-xs text-text-dim mb-1">
                                            Throughput (RPS)
                                        </p>
                                        <p className="text-lg font-bold text-accent2">
                                            {
                                                selectedSim.result_summary
                                                    .throughput_rps
                                            }
                                        </p>
                                    </div>
                                    <div className="p-3 bg-bg-primary rounded border border-border-primary">
                                        <p className="text-xs text-text-dim mb-1">
                                            Duration
                                        </p>
                                        <p className="text-lg font-bold text-status-green">
                                            {
                                                selectedSim.result_summary
                                                    .simulation_time_sec
                                            }
                                            s
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16 text-text-dim">
                            <p>Select a simulation to view its logs</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
