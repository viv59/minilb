import Card from "../common/Card.jsx";
import Button from "../common/Button.jsx";

export default function ServerCard({ server, onEdit, onDelete }) {
    console.log(server);

    const formatIST = (date) =>
        new Date(date + "Z")
            .toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            })
            .replace("am", "AM")
            .replace("pm", "PM");

    return (
        <Card>
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{server.name}</div>
                <div>
                    {server.status ? (
                        <span className="text-xs text-status-green">
                            ● {server.status}
                        </span>
                    ) : (
                        <span className="text-xs text-status-red">
                            ● {server.status}
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-text-dim">
                <div className="flex justify-between">
                    <span>ID</span>
                    <span>{server.id}</span>
                </div>
                <div className="flex justify-between">
                    <span>Hostname</span>
                    <span>{server.hostname}</span>
                </div>
                <div className="flex justify-between">
                    <span>IP Address</span>
                    <span>{server.ip}</span>
                </div>
                <div className="flex justify-between">
                    <span>Port</span>
                    <span>{server.port}</span>
                </div>
                <div className="flex justify-between">
                    <span>Maintenance Mode</span>
                    <span>
                            {server.maintenanceMode ? (
                                "Yes"
                            ) : (
                                "No"
                            )}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Weight</span>
                    <span>{server.weight}</span>
                </div>
                <div className="flex justify-between">
                    <span>Priority</span>
                    <span>{server.priority}</span>
                </div>
                <div className="flex justify-between">
                    <span>Max Connections</span>
                    <span>{server.maxConnections}</span>
                </div>
                <div className="flex justify-between">
                    <span>CPU Core</span>
                    <span>{server.cpu}</span>
                </div>
                <div className="flex justify-between">
                    <span>Memory</span>
                    <span>{server.memory}</span>
                </div>
                <div className="flex justify-between">
                    <span>Region</span>
                    <span>{server.region}</span>
                </div>
                <div className="flex justify-between">
                    <span>Country</span>
                    <span>{server.country}</span>
                </div>
                <div className="flex justify-between">
                    <span>Datacenter</span>
                    <span>{server.datacenter}</span>
                </div>
                <div className="flex justify-between">
                    <span>Supports Sticky Session</span>
                    <span>{server.supportsStickySession ? ("Yes") : ("No")}</span>
                </div>
                <div className="flex justify-between">
                    <span>Created At</span>
                    <span>
                        {server.createdAt ? formatIST(server.createdAt) : "NULL"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Updated At</span>
                    <span>
                        {server.updatedAt ? formatIST(server.updatedAt) : "NULL"}
                    </span>
                </div>
                {/* <div className="flex justify-between">
                    <span>Created At</span>
                    <span>{server.createdAt}</span>
                </div> */}

            </div>
            <div className="mt-4 flex gap-2">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(server.id)}
                >
                    Edit
                </Button>
                <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => onDelete(server.id)}
                >
                    Delete
                </Button>
            </div>
        </Card>
    );
}
