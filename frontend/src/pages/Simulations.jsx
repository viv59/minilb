import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Trash2, Plus } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import Loader from "../components/common/Loader.jsx";
import { useSimulation } from "../hooks/useSimulation.js";

const ALGORITHM_OPTIONS = [
    { value: "round_robin", label: "Round Robin" },
    { value: "least_connections", label: "Least Connections" },
    { value: "weighted", label: "Weighted" },
    { value: "ip_hash", label: "IP Hash" },
];

export default function Simulations() {
    const navigate = useNavigate();
    const {
        simulations,
        loading,
        error,
        fetchSimulations,
        createSimulation,
        startSimulation,
    } = useSimulation();

    const [name, setName] = useState("demo-run");
    const [algorithm, setAlgorithm] = useState("round_robin");
    const [waves, setWaves] = useState([
        { wave: 1, requests: 20, interval_ms: 10 },
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [createError, setCreateError] = useState(null);

    useEffect(() => {
        fetchSimulations();
    }, []);

    function updateWave(index, patch) {
        setWaves((prev) =>
            prev.map((w, i) => (i === index ? { ...w, ...patch } : w)),
        );
    }

    function addWave() {
        setWaves((prev) => [
            ...prev,
            { wave: prev.length + 1, requests: 10, interval_ms: 10 },
        ]);
    }

    function removeWave(index) {
        setWaves((prev) =>
            prev
                .filter((_, i) => i !== index)
                .map((w, i) => ({ ...w, wave: i + 1 })),
        );
    }

    async function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        setCreateError(null);

        try {
            const payload = {
                simulation_name: name,
                algorithm,
                traffic_waves: waves,
            };
            const sim = await createSimulation(payload);

            // Reset form
            setName("demo-run");
            setAlgorithm("round_robin");
            setWaves([{ wave: 1, requests: 20, interval_ms: 10 }]);

            // Refetch simulations
            await fetchSimulations();
        } catch (err) {
            setCreateError(err.message || "Failed to create simulation");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleStart(simId) {
        try {
            await startSimulation(simId);
            navigate(`/simulation/${simId}`);
        } catch (err) {
            setCreateError(err.message || "Failed to start simulation");
        }
    }

    // Filter only CREATED simulations (not started)
    const createdSimulations = simulations.filter(
        (s) => s.status === "CREATED",
    );

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-lg font-semibold">Simulations</h1>

            {/* Create Simulation Card */}
            <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                    Create New Simulation
                </h2>

                {createError && (
                    <div className="mb-4 p-3 bg-status-red/10 border border-status-red/30 rounded text-status-red text-sm">
                        {createError}
                    </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Simulation Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-black placeholder-text-dim focus:border-accent1 focus:outline-none"
                            placeholder="Enter simulation name"
                            required
                        />
                    </div>

                    {/* Algorithm Select */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Load Balancing Algorithm
                        </label>
                        <select
                            value={algorithm}
                            onChange={(e) => setAlgorithm(e.target.value)}
                            className="w-full rounded-lg border border-border-primary bg-bg-primary px-3 py-2 text-black focus:border-accent1 focus:outline-none"
                        >
                            {ALGORITHM_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Traffic Waves */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-text-primary">
                                Traffic Waves
                            </label>
                            <Button
                                type="button"
                                onClick={addWave}
                                variant="secondary"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Wave
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {waves.map((wave, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-3 p-3 bg-bg-primary border border-border-primary rounded-lg items-end"
                                >
                                    <div className="flex-1">
                                        <label className="block text-xs text-text-dim mb-1">
                                            Requests
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={wave.requests}
                                            onChange={(e) =>
                                                updateWave(idx, {
                                                    requests: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="w-full rounded border border-border-primary bg-bg-secondary px-2 py-1 text-sm text-black focus:border-accent1 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-text-dim mb-1">
                                            Interval (ms)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={wave.interval_ms}
                                            onChange={(e) =>
                                                updateWave(idx, {
                                                    interval_ms: parseInt(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="w-full rounded border border-border-primary bg-bg-secondary px-2 py-1 text-sm text-black focus:border-accent1 focus:outline-none"
                                        />
                                    </div>
                                    {waves.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeWave(idx)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-accent1 to-accent2 text-white font-medium py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting ? "Creating..." : "Create Simulation"}
                    </Button>
                </form>
            </Card>

            {/* List of Created Simulations */}
            <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                    Available Simulations
                </h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader size={24} />
                    </div>
                ) : error ? (
                    <div className="p-4 bg-status-red/10 border border-status-red/30 rounded text-status-red text-sm">
                        {error}
                    </div>
                ) : createdSimulations.length === 0 ? (
                    <div className="text-center py-8 text-text-dim">
                        No simulations created yet. Create one above!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-primary">
                                    <th className="text-left py-3 px-4 text-text-dim font-medium">
                                        Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-text-dim font-medium">
                                        Algorithm
                                    </th>
                                    <th className="text-left py-3 px-4 text-text-dim font-medium">
                                        Waves
                                    </th>
                                    <th className="text-left py-3 px-4 text-text-dim font-medium">
                                        Total Requests
                                    </th>
                                    <th className="text-left py-3 px-4 text-text-dim font-medium">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-text-dim font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {createdSimulations.map((sim) => {
                                    const totalReqs =
                                        sim.traffic_waves?.reduce(
                                            (sum, w) => sum + (w.requests ?? 0),
                                            0,
                                        ) ?? 0;

                                    return (
                                        <tr
                                            key={sim.id}
                                            className="border-b border-border-primary hover:bg-bg-primary/50 transition"
                                        >
                                            <td className="py-3 px-4 text-text-primary">
                                                {sim.name}
                                            </td>
                                            <td className="py-3 px-4 text-text-primary">
                                                {sim.algorithm}
                                            </td>
                                            <td className="py-3 px-4 text-text-primary">
                                                {sim.traffic_waves?.length ?? 0}
                                            </td>
                                            <td className="py-3 px-4 text-text-primary">
                                                {totalReqs}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-status-yellow/20 text-status-yellow">
                                                    {sim.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button
                                                    onClick={() =>
                                                        handleStart(sim.id)
                                                    }
                                                    variant="primary"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Play size={14} />
                                                    Start
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
