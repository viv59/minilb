import { useEffect } from "react";

import Card from "../components/common/Card.jsx";
import TrafficDonut from "../components/dashboard/TrafficDonut.jsx";
import HealthSummary from "../components/dashboard/HealthSummary.jsx";

import { useStatistics } from "../hooks/useStatistics.js";

function Stat({ label, value }) {
    return (
        <div className="rounded-lg border border-app-border-soft p-4">
            <p className="text-text-faint">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
    );
}

export default function Analytics() {
    const { stats, loading, error, fetchStatistics } = useStatistics();

    useEffect(() => {
        fetchStatistics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-text-dim">Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-status-red">{error}</p>
            </div>
        );
    }

    const loadBalance = stats?.load_balance ?? {};
    const capacity = stats?.capacity ?? {};
    const health = stats?.health ?? {};

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-lg font-semibold">Analytics</h1>

            <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
                <TrafficDonut />

                <HealthSummary />

                <Card
                    title="Overall Statistics"
                    className="col-span-2 max-[900px]:col-span-1"
                >
                    <div className="grid grid-cols-2 gap-4 text-sm max-[600px]:grid-cols-1">
                        <Stat label="Total Requests Processed" value={stats?.total_requests ?? 0} />
                        <Stat label="Total Servers" value={stats?.total_servers ?? 0} />
                    </div>
                </Card>

                <Card
                    title="Load Balance Fairness"
                    className="col-span-2 max-[900px]:col-span-1"
                >
                    <div className="grid grid-cols-4 gap-4 text-sm max-[600px]:grid-cols-2">
                        <Stat
                            label="Busiest Server"
                            value={loadBalance.busiest_server ?? "—"}
                        />
                        <Stat
                            label="Busiest Server Requests"
                            value={loadBalance.busiest_server_requests ?? 0}
                        />
                        <Stat
                            label="Idle Servers"
                            value={loadBalance.idle_server_count ?? 0}
                        />
                        <Stat
                            label="Imbalance Ratio"
                            value={loadBalance.imbalance_ratio ?? "—"}
                        />
                    </div>
                    {loadBalance.idle_servers?.length > 0 && (
                        <p className="mt-3 text-xs text-text-faint">
                            Idle: {loadBalance.idle_servers.join(", ")}
                        </p>
                    )}
                </Card>

                <Card title="Capacity & Resource Usage">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <Stat label="Avg CPU (cores)" value={capacity.avg_cpu_cores ?? "—"} />
                        <Stat label="Avg Memory (MB)" value={capacity.avg_memory_mb ?? "—"} />
                        <Stat
                            label="Total Max Connections"
                            value={capacity.total_max_connections ?? 0}
                        />
                        <Stat label="Avg Weight" value={capacity.avg_weight ?? "—"} />
                    </div>
                </Card>

                <Card title="Health & Error Metrics">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <Stat
                            label="Avg Response Time (ms)"
                            value={health.avg_response_time_ms ?? "—"}
                        />
                        <Stat
                            label="Avg Error Rate"
                            value={
                                health.avg_error_rate != null
                                    ? `${(health.avg_error_rate * 100).toFixed(2)}%`
                                    : "—"
                            }
                        />
                        <Stat
                            label="Avg CPU Usage"
                            value={
                                health.avg_cpu_usage_percent != null
                                    ? `${health.avg_cpu_usage_percent}%`
                                    : "—"
                            }
                        />
                        <Stat
                            label="Servers w/ High Error Rate"
                            value={health.servers_high_error_rate ?? 0}
                        />
                    </div>
                    <p className="mt-3 text-xs text-text-faint">
                        Based on {health.servers_reporting ?? 0} server(s) currently reporting health data.
                    </p>
                </Card>
            </div>
        </div>
    );
}