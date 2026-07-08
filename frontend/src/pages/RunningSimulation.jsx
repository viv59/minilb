import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Square, ArrowLeft, Eye } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import WaveProgress from "../components/simulation/WaveProgress.jsx";
import SimulationLogs from "../components/simulation/SimulationLogs.jsx";
import NetworkDiagram from "../components/network/NetworkDiagram.jsx";
import Loader from "../components/common/Loader.jsx";
import { useSimulation } from "../hooks/useSimulation.js";

export default function RunningSimulation() {
    const { simId } = useParams();
    const navigate = useNavigate();
    const {
        activeSimulation,
        status,
        summary,
        loading,
        stopSimulation,
        clearActiveSimulation,
    } = useSimulation();
    const [error, setError] = useState(null);

    useEffect(() => {
        // Only show error if no active simulation at all
        if (!activeSimulation) {
            setError("No active simulation found");
        }
    }, [activeSimulation]);

    const handleStop = async () => {
        try {
            await stopSimulation(parseInt(simId));
            // Give a moment for the UI to update, then redirect
            setTimeout(() => {
                navigate("/simulation-logs");
            }, 1000);
        } catch (err) {
            setError(err.message || "Failed to stop simulation");
        }
    };

    const handleViewLogs = () => {
        clearActiveSimulation();
        navigate("/simulation-logs");
    };

    const handleBackToSimulations = () => {
        clearActiveSimulation();
        navigate("/simulations");
    };

    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleBackToSimulations}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Button>
                </div>
                <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                    <div className="text-center py-8">
                        <p className="text-status-red mb-4">{error}</p>
                        <Button
                            onClick={handleBackToSimulations}
                            className="bg-gradient-to-r from-accent1 to-accent2 text-white font-medium py-2 px-4 rounded-lg"
                        >
                            Go to Simulations
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const isCompleted = status === "COMPLETED" || status === "STOPPED";

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 px-6">
                    {/* <Button
                        onClick={handleBackToSimulations}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Button> */}
                    <h1 className="text-lg font-semibold">
                        {activeSimulation?.name || "Simulation"}
                    </h1>
                </div>

                <div className="flex gap-3">
                    {isCompleted ? (
                        <>
                            <Button
                                onClick={handleViewLogs}
                                variant="secondary"
                                className="flex items-center gap-2"
                            >
                                <Eye size={16} />
                                View All Logs
                            </Button>
                            <Button
                                onClick={handleBackToSimulations}
                                className="bg-gradient-to-r from-accent1 to-accent2 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Back to Simulations
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleStop}
                            variant="danger"
                            className="flex items-center gap-2"
                        >
                            <Square size={16} />
                            Stop Simulation
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Card */}
            <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
                    <div>
                        <p className="text-text-dim text-sm mb-1">Status</p>
                        <p className="text-base font-bold">
                            <span
                                className={
                                    status === "RUNNING"
                                        ? "text-status-green"
                                        : status === "COMPLETED"
                                          ? "text-accent2"
                                          : status === "STOPPED"
                                            ? "text-status-red"
                                            : "text-text-dim"
                                }
                            >
                                {status || "RUNNING"}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-text-dim text-sm mb-1">Algorithm</p>
                        <p className="text-base font-semibold text-text-primary">
                            {activeSimulation?.algorithm || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-text-dim text-sm mb-1">Duration</p>
                        <p className="text-base font-semibold text-text-primary">
                            {summary?.simulation_time_sec
                                ? `${summary.simulation_time_sec}s`
                                : "In Progress"}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Wave Progress */}
            <WaveProgress />

            {/* Summary Stats (when completed) */}
            {summary && (
                <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                    <h2 className="text-sm font-semibold text-text-primary mb-4">
                        Simulation Summary
                    </h2>
                    <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2">
                        <div className="p-4 bg-bg-primary rounded-lg border border-border-primary">
                            <p className="text-text-dim text-sm mb-1">
                                Total Requests
                            </p>
                            <p className="text-lg font-bold text-accent1">
                                {summary.total_requests}
                            </p>
                        </div>
                        <div className="p-4 bg-bg-primary rounded-lg border border-border-primary">
                            <p className="text-text-dim text-sm mb-1">
                                Throughput (RPS)
                            </p>
                            <p className="text-lg font-bold text-accent2">
                                {summary.throughput_rps}
                            </p>
                        </div>
                        <div className="p-4 bg-bg-primary rounded-lg border border-border-primary">
                            <p className="text-text-dim text-sm mb-1">
                                Time Elapsed
                            </p>
                            <p className="text-lg font-bold text-status-green">
                                {summary.simulation_time_sec}s
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Network Diagram */}
            <NetworkDiagram />

            {/* Logs */}
            <SimulationLogs simulationId={parseInt(simId)} />
        </div>
    );
}
