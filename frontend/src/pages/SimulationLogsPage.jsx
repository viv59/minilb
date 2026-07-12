import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Card from "../components/common/Card.jsx";
import Button from "../components/common/Button.jsx";
import Loader from "../components/common/Loader.jsx";
import { simulationApi } from "../api/simulationApi.js";
import { useSimulation } from "../hooks/useSimulation.js";

export default function SimulationLogsPage() {
    const navigate = useNavigate();
    // const [simulations, fetchSimulations, setSimulations] = useSimulation();
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    // const { simulation, removeSimulation } = useSimulation();
    const { simulations, fetchSimulations, removeSimulation, loading, error } = useSimulation();

    useEffect(() => {
        fetchSimulations();
    }, []);

    // async function fetchSimulations() {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const data = await simulationApi.list();
    //         console.log(data);
    //         // const completedSims = data.filter(
    //         //     (s) =>
    //         //         s.status === "COMPLETED" ||
    //         //         s.status === "STOPPED" ||
    //         //         s.status === "FAILED",
    //         // );
    //         const completedSims = data;
    //         console.log(completedSims);
    //         setSimulations(completedSims);
    //     } catch (err) {
    //         setError(err.message || "Failed to load simulations");
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    function handleSelectSimulation(sim) {
        navigate(`/simulation-log/${sim.id}`, {
            state: {
                result_summary: sim.result_summary,
            },
        });
    }

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

            <div className="">
                {/* Simulations List */}
                {/* <Card className="bg-bg-secondary border border-border-primary rounded-lg p-6 col-span-1"> */}
                {/* <div className="flex items-center justify-between mb-4">
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
                </div> */}

                {/* {loading ? (
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
                                    // className={`w-full text-left p-3 rounded-lg border transition ${
                                    //     selectedSim?.id === sim.id
                                    //         ? "border-accent1 bg-accent1/10"
                                    //         : "border-border-primary hover:border-accent1/50 bg-bg-primary"
                                    // }`}
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
                    )} */}

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
                    <div className="overflow-x-auto rounded-lg border border-border-primary">
                        <table className="w-full border-collapse">
                            <thead className="bg-bg-primary sticky top-0">
                                <tr className="border-b border-border-primary">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                                        Algorithm
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {simulations.map((sim) => (
                                    <tr
                                        key={sim.id}
                                        // onClick={() =>
                                        //     handleSelectSimulation(sim)
                                        // }
                                        className="border-b border-border-primary transition-colors hover:bg-bg-primary"
                                    >
                                        <td className="px-4 py-3 text-sm text-text-primary">
                                            {sim.id}
                                        </td>

                                        <td
                                            className="cursor-pointer px-4 py-3 text-sm text-text-primary"
                                            onClick={() =>
                                                handleSelectSimulation(sim)
                                            }
                                        >
                                            {sim.name}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-text-dim">
                                            {sim.algorithm}
                                        </td>

                                        <td className="px-4 py-3 text-sm text-text-dim">
                                            <span
                                            // className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                            //     sim.status === "COMPLETED"
                                            //         ? "bg-status-green/20 text-status-green"
                                            //         : sim.status ===
                                            //             "STOPPED"
                                            //           ? "bg-status-red/20 text-status-red"
                                            //           : "bg-status-yellow/20 text-status-yellow"
                                            // }`}
                                            >
                                                {sim.status}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-text-dim">
                                            {sim.created_at
                                                ? new Date(
                                                      sim.created_at,
                                                  ).toLocaleString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text-dim">
                                            <Button
                                                variant="danger"
                                                onClick={() =>
                                                    removeSimulation(sim.id)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* </Card> */}
            </div>
        </div>
    );
}
