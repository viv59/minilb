// src/components/simulation/SimulationControls.jsx
import { useState } from "react";
import { Play, Square, Plus, Trash2 } from "lucide-react";
import Card from "../common/Card.jsx";
import Button from "../common/Button.jsx";
import { useSimulation } from "../../hooks/useSimulation.js";

const ALGORITHM_OPTIONS = [
    { value: "round_robin", label: "Round Robin" },
    { value: "least_connections", label: "Least Connections" },
    { value: "weighted", label: "Weighted" },
    { value: "ip_hash", label: "IP Hash" },
];

const STATUS_STYLES = {
    CREATED: "text-text-dim",
    RUNNING: "text-status-green",
    COMPLETED: "text-accent2",
    STOPPED: "text-text-faint",
    FAILED: "text-status-red",
};

export default function SimulationControls() {
    const { activeSimulation, status, createSimulation, startSimulation, stopSimulation } =
        useSimulation();

    const [name, setName] = useState("demo-run");
    const [algorithm, setAlgorithm] = useState("round_robin");
    const [waves, setWaves] = useState([{ wave: 1, requests: 20, interval_ms: 10 }]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    function updateWave(index, patch) {
        setWaves((prev) => prev.map((w, i) => (i === index ? { ...w, ...patch } : w)));
    }

    function addWave() {
        setWaves((prev) => [...prev, { wave: prev.length + 1, requests: 10, interval_ms: 10 }]);
    }

    function removeWave(index) {
        setWaves((prev) =>
            prev.filter((_, i) => i !== index).map((w, i) => ({ ...w, wave: i + 1 }))
        );
    }

    async function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await createSimulation({
                simulation_name: name,
                algorithm,
                traffic_waves: waves,
            });
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to create simulation");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStart() {
        if (!activeSimulation) return;
        setError(null);
        try {
            await startSimulation(activeSimulation.id);
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to start simulation");
        }
    }

    async function handleStop() {
        if (!activeSimulation) return;
        setError(null);
        try {
            await stopSimulation(activeSimulation.id);
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to stop simulation");
        }
    }

    const canEdit = !activeSimulation || status === "CREATED";
    const canStart = activeSimulation && (status === "CREATED" || status === "STOPPED");
    const canStop = status === "RUNNING";

    return (
        <Card
            title="Traffic Simulation"
            action={
                activeSimulation && (
                    <span className={`text-xs font-semibold ${STATUS_STYLES[status] ?? "text-text-dim"}`}>
                        ● {status}
                    </span>
                )
            }
        >
            <form onSubmit={handleCreate} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs text-text-faint">Simulation name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!canEdit}
                            className="w-full rounded-lg border border-app-border bg-[#0d0f1e] px-3 py-2 text-sm outline-none focus:border-accent1 disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs text-text-faint">Algorithm</label>
                        <select
                            value={algorithm}
                            onChange={(e) => setAlgorithm(e.target.value)}
                            disabled={!canEdit}
                            className="w-full rounded-lg border border-app-border bg-[#0d0f1e] px-3 py-2 text-sm outline-none focus:border-accent1 disabled:opacity-50"
                        >
                            {ALGORITHM_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs text-text-faint">Traffic waves</label>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={addWave}
                                className="flex items-center gap-1 text-xs text-accent2 hover:underline"
                            >
                                <Plus size={12} /> Add wave
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {waves.map((w, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-14 flex-shrink-0 text-xs text-text-faint">Wave {w.wave}</span>
                                <input
                                    type="number"
                                    value={w.requests}
                                    onChange={(e) => updateWave(i, { requests: Number(e.target.value) })}
                                    disabled={!canEdit}
                                    placeholder="Requests"
                                    className="w-full min-w-0 flex-1 rounded-lg border border-app-border bg-[#0d0f1e] px-2 py-1.5 text-xs outline-none focus:border-accent1 disabled:opacity-50"
                                />
                                <input
                                    type="number"
                                    value={w.interval_ms}
                                    onChange={(e) => updateWave(i, { interval_ms: Number(e.target.value) })}
                                    disabled={!canEdit}
                                    placeholder="Interval (ms)"
                                    className="w-full min-w-0 flex-1 rounded-lg border border-app-border bg-[#0d0f1e] px-2 py-1.5 text-xs outline-none focus:border-accent1 disabled:opacity-50"
                                />
                                {canEdit && waves.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeWave(i)}
                                        className="flex-shrink-0 text-text-faint hover:text-status-red"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-xs text-status-red">{error}</p>}

                <div className="flex gap-2.5 pt-1">
                    {canEdit && (
                        <Button type="submit" disabled={submitting} className="flex-1">
                            {submitting ? "Creating…" : activeSimulation ? "Recreate" : "Create Simulation"}
                        </Button>
                    )}
                    {canStart && (
                        <Button
                            type="button"
                            onClick={handleStart}
                            className="flex flex-1 items-center justify-center gap-1.5"
                        >
                            <Play size={14} /> Start
                        </Button>
                    )}
                    {canStop && (
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleStop}
                            className="flex flex-1 items-center justify-center gap-1.5"
                        >
                            <Square size={14} /> Stop
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}