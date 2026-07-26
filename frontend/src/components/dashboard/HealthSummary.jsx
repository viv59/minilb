import { CheckCircle2, AlertTriangle, Wrench } from "lucide-react";
import Card from "../common/Card.jsx";
import { useStatistics } from "../../hooks/useStatistics.js";

export default function HealthSummary() {
    const { stats, loading } = useStatistics();

    if (loading || !stats) {
        return <Card title="Health Summary">Loading...</Card>;
    }

    return (
        <Card title="Health Summary">
            <div className="flex items-center gap-2 py-1.5 text-sm">
                <CheckCircle2
                    size={16}
                    className="text-status-green"
                />
                <span>{stats.healthy_servers} Healthy</span>
            </div>

            <div className="flex items-center gap-2 py-1.5 text-sm">
                <AlertTriangle
                    size={16}
                    className="text-status-red"
                />
                <span>{stats.unhealthy_servers} Unhealthy</span>
            </div>

            <div className="flex items-center gap-2 py-1.5 text-sm">
                <Wrench
                    size={16}
                    className="text-status-yellow"
                />
                <span>{stats.maintenance_servers} Maintenance</span>
            </div>

            <div className="mt-4 border-t border-app-border-soft pt-3 text-sm text-text-faint">
                Total Servers: <strong>{stats.total_servers}</strong>
            </div>
        </Card>
    );
}