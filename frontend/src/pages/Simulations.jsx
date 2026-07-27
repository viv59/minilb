import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Trash2, Plus } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import Loader from "../components/common/Loader.jsx";
import { useSimulation } from "../hooks/useSimulation.js";
import { useServers } from '../hooks/useServers.js'

const ALGORITHM_OPTIONS = [
    { value: "round_robin", label: "Round Robin", short_form: "RR" },
    { value: "least_connections", label: "Least Connections", short_form: "LC" },
    { value: "weighted_least_connections", label: "Weighted Least Connections", short_form: "WLC" },
    { value: "weighted_round_robin", label: "Weighted Round Robin", short_form: "WRR" },
    { value: "ip_hash", label: "IP Hash", short_form: "IH"},
    { value: "consistent_hash", label: "Consistent Hash", short_form: "CH" },
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

    const [name, setName] = useState(() => {
        const short =
            ALGORITHM_OPTIONS.find(a => a.value === "round_robin")?.short_form ?? "";

        return generateSimulationName("Sim", short);
    });
    const [algorithm, setAlgorithm] = useState("round_robin");
    const [waves, setWaves] = useState([
        { wave: 1, requests: 100, interval_ms: 50 },
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [createError, setCreateError] = useState(null);

    const { servers, fetchServers } = useServers()

    useEffect(() => {
        fetchSimulations();
        fetchServers();
    }, []);

    useEffect(() => {
        const short =
            ALGORITHM_OPTIONS.find(a => a.value === algorithm)?.short_form ?? "";

        setName(generateSimulationName("Sim", short));
    }, [algorithm]);

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
            console.log(sim)

            // Reset form
            // setName("demo-run");

            const short = ALGORITHM_OPTIONS.find(a => a.value === "round_robin")?.short_form ?? "";

            setName(generateSimulationName("Sim", short));

            // setName(generateSimulationName("rr"));
            setAlgorithm("round_robin");
            setWaves([{ wave: 1, requests: 100, interval_ms: 50 }]);

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

    function generateSimulationName(prefix = "Sim", shortForm = ""){
        const now = new Date();

        const date = `${String(now.getDate()).padStart(2, "0")}` +
                     `${String(now.getMonth() + 1).padStart(2, "0")}` +
                     `${now.getFullYear()}`;

        const unique = `${Date.now().toString(36)}${crypto.randomUUID().slice(0, 4)}`;

        const time = `${String(now.getHours()).padStart(2, "0")}` +
                     `${String(now.getMinutes()).padStart(2, "0")}` +
                     `${String(now.getSeconds()).padStart(2, "0")}`;

        return `${prefix}${shortForm}_${date}${time}`;
    }

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="flex items-center gap-2 border border-primary"
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
            {/* <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6">
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
            </Card> */}
            <div className="flex flex-col gap-4">
                <h2 className="text-sm font-medium text-text-dim">
                    Available simulations
                </h2>
 
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size={20} />
                    </div>
                ) : error ? (
                    <div className="py-4 text-sm text-status-red">
                        {error}
                    </div>
                ) : createdSimulations.length === 0 ? (
                    <div className="py-12 text-center text-sm text-text-dim">
                        No simulations created yet
                    </div>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border-primary text-left text-text-dim">
                                <th className="py-2 pr-4 font-medium">
                                    Name
                                </th>
                                <th className="py-2 pr-4 font-medium">
                                    Algorithm
                                </th>
                                <th className="py-2 pr-4 font-medium">
                                    Waves
                                </th>
                                <th className="py-2 pr-4 font-medium">
                                    Requests
                                </th>
                                <th className="py-2 pr-4 font-medium">
                                    Created
                                </th>
                                <th className="py-2 pr-4 text-right font-medium">
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
                                        className="border-b border-border-primary/50 text-text-primary"
                                    >
                                        <td className="py-2.5 pr-4">
                                            {sim.name}
                                        </td>
                                        <td className="py-2.5 pr-4 text-text-dim">
                                            {sim.algorithm}
                                        </td>
                                        <td className="py-2.5 pr-4 text-text-dim">
                                            {sim.traffic_waves?.length ?? 0}
                                        </td>
                                        <td className="py-2.5 pr-4 text-text-dim">
                                            {totalReqs}
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
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() =>
                                                        handleStart(sim.id)
                                                    }
                                                    className="flex items-center gap-1.5 text-text-dim hover:text-accent1"
                                                    title="Start"
                                                >
                                                    <Play size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
