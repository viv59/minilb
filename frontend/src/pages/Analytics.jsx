import { useEffect } from "react";

import Card from "../components/common/Card.jsx";
import TrafficDonut from "../components/dashboard/TrafficDonut.jsx";
import HealthSummary from "../components/dashboard/HealthSummary.jsx";

import { useStatistics } from "../hooks/useStatistics.js";

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

    return (
        <div className="flex flex-col gap-5">
            <h1 className="text-lg font-semibold">Analytics</h1>

            <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
                <TrafficDonut />

                <HealthSummary />

                {/* <Card
                    title="Overall Statistics"
                    className="col-span-2 max-[900px]:col-span-1"
                >
                    <div className="grid grid-cols-2 gap-4 text-sm max-[600px]:grid-cols-1">
                        <div className="rounded-lg border border-app-border-soft p-4">
                            <p className="text-text-faint">
                                Total Requests Processed
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {stats?.total_requests ?? 0}
                            </p>
                        </div>

                        <div className="rounded-lg border border-app-border-soft p-4">
                            <p className="text-text-faint">
                                Total Servers
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {stats?.total_servers ?? 0}
                            </p>
                        </div>
                    </div>
                </Card> */}
            </div>
        </div>
    );
}