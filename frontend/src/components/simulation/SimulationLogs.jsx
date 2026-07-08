// src/components/simulation/SimulationLogs.jsx
import { useState, useEffect } from "react";
import { Download, Trash2, RefreshCw } from "lucide-react";
import Card from "../common/Card.jsx";
import Button from "../common/Button.jsx";
import { simulationApi } from "../../api/simulationApi.js";

export default function SimulationLogs({ simulationId }) {
    const [logs, setLogs] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await simulationApi.getLogs(simulationId);
            setLogs(response.logs || "");
            setLastFetched(new Date().toLocaleTimeString());
        } catch (err) {
            setError(
                "Failed to fetch logs: " + (err.message || "Unknown error"),
            );
            setLogs("");
        } finally {
            setLoading(false);
        }
    };

    const deleteLogs = async () => {
        if (!confirm("Are you sure you want to delete these logs?")) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await simulationApi.deleteLogs(simulationId);
            setLogs("");
            setLastFetched(null);
            setError(null);
        } catch (err) {
            setError(
                "Failed to delete logs: " + (err.message || "Unknown error"),
            );
        } finally {
            setLoading(false);
        }
    };

    const downloadLogs = () => {
        if (!logs) {
            setError("No logs to download");
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([logs], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = `simulation_${simulationId}_logs.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    useEffect(() => {
        if (simulationId) {
            fetchLogs();
        }
    }, [simulationId]);

    return (
        <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-text-primary">
                    Simulation Logs
                </h3>
                <div className="flex gap-2">
                    <Button
                        onClick={fetchLogs}
                        disabled={loading}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </Button>
                    <Button
                        onClick={downloadLogs}
                        disabled={loading || !logs}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download
                    </Button>
                    <Button
                        onClick={deleteLogs}
                        disabled={loading || !logs}
                        variant="danger"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-status-red/10 border border-status-red/30 rounded text-status-red text-sm">
                    {error}
                </div>
            )}

            {lastFetched && (
                <div className="mb-3 text-xs text-text-dim">
                    Last fetched: {lastFetched}
                </div>
            )}

            <div className="bg-bg-primary border border-border-primary rounded p-4 max-h-96 overflow-auto font-mono text-sm">
                {loading ? (
                    <div className="text-text-dim text-center py-8">
                        Loading logs...
                    </div>
                ) : logs ? (
                    <pre className="text-text-primary whitespace-pre-wrap break-words">
                        {logs}
                    </pre>
                ) : (
                    <div className="text-text-dim text-center py-8">
                        No logs available yet
                    </div>
                )}
            </div>
        </Card>
    );
}
