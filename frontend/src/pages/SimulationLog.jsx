import { useEffect, useState } from "react";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import Loader from "../components/common/Loader.jsx";
import { simulationApi } from "../api/simulationApi.js";

export default function SimulationLog() {
    const { simId } = useParams();
    console.log("Route param:", simId, typeof simId);
    const navigate = useNavigate();
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState(null);
    const [logs, setLogs] = useState("");
    const location = useLocation()

    const result_summary = location.state?.result_summary

    console.log(result_summary)

    async function fetchSimulationLogs(id) {
        console.log(id)
        setLogsLoading(true);
        setLogsError(null);

        try {
            const response = await simulationApi.getLogs(id);
            console.log(response)
            setLogs(response.logs || "");
        } catch (error) {
            setLogsError(
                "Failed to fetch logs: " + (error.message || "Unknown error"),
            );
            setLogs("");
        } finally {
            setLogsLoading(false);
        }
    }

    useEffect(() => {
        if (simId) {
            fetchSimulationLogs(simId);
        }
    }, [simId]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <Button
                    onClick={() => navigate("/simulation-logs")}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back to logs
                </Button>
                <Button
                    onClick={() => fetchSimulationLogs(simId)}
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <RefreshCw size={16} />
                    Refresh
                </Button>
            </div>

            <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                <div className="mb-4">
                    {/* <h1 className="text-lg font-semibold text-text-primary">
                        Simulation Logs
                    </h1> */}
                    <p className="text-sm text-text-dim">
                        Showing logs for simulation {simId}
                    </p>
                </div>

                {logsError && (
                    <div className="mb-4 rounded border border-status-red/30 bg-status-red/10 p-3 text-sm text-status-red">
                        {logsError}
                    </div>
                )}

                <div className="h-[70vh] overflow-auto rounded border border-border-primary bg-bg-primary p-4 font-mono text-sm">
                    {logsLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader size={24} />
                        </div>
                    ) : logs ? (
                        <pre className="whitespace-pre-wrap break-words text-text-primary">
                            {logs}
                        </pre>
                    ) : (
                        <div className="py-8 text-center text-text-dim">
                            No logs available
                        </div>
                    )}
                </div>
                <div>
                    {result_summary && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-bg-primary rounded border border-border-primary">
                                        <p className="text-xs text-text-dim mb-1">
                                            Total Requests
                                        </p>
                                        <p className="text-lg font-bold text-accent1">
                                            {
                                                result_summary.total_requests
                                            }
                                        </p>
                                    </div>
                                    <div className="p-3 bg-bg-primary rounded border border-border-primary">
                                        <p className="text-xs text-text-dim mb-1">
                                            Throughput (RPS)
                                        </p>
                                        <p className="text-lg font-bold text-accent2">
                                            {
                                                result_summary.throughput_rps
                                            }
                                        </p>
                                    </div>
                                    <div className="p-3 bg-bg-primary rounded border border-border-primary">
                                        <p className="text-xs text-text-dim mb-1">
                                            Duration
                                        </p>
                                        <p className="text-lg font-bold text-status-green">
                                            {
                                                result_summary.simulation_time_sec
                                            }
                                            s
                                        </p>
                                    </div>
                                </div>
                            )}

                </div>

            </Card>
        </div>
    );
}
