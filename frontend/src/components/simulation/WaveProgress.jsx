// src/components/simulation/WaveProgress.jsx
import Card from "../common/Card.jsx";
import { useSimulation } from "../../hooks/useSimulation.js";

export default function WaveProgress() {
    const { activeSimulation, status, processed, totalPlanned, currentWave, summary } =
        useSimulation();

    if (!activeSimulation) return null;

    const pct = totalPlanned > 0 ? Math.min(100, (processed / totalPlanned) * 100) : 0;

    return (
        <Card title="Simulation Progress">
            <div className="mb-2 flex items-center justify-between text-xs text-text-faint">
                <span>{currentWave ? `Wave ${currentWave}` : "Waiting to start"}</span>
                <span>
                    {processed} / {totalPlanned} requests
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                    className="h-full bg-gradient-to-r from-accent1 to-accent2 transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>

            {status === "COMPLETED" && summary && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <div className="text-text-faint">Throughput</div>
                        <div className="text-sm font-semibold">
                            {summary.throughput_rps.toFixed(2)} req/s
                        </div>
                    </div>
                    <div>
                        <div className="text-text-faint">Duration</div>
                        <div className="text-sm font-semibold">
                            {summary.simulation_time_sec.toFixed(2)}s
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}