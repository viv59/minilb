// src/components/network/ServerNode.jsx
import { forwardRef } from "react";
import { Server as ServerIcon } from "lucide-react";

const ServerNode = forwardRef(function ServerNode(
    { server, selected, pulsing, handledRequests, onSelect },
    ref,
) {
    const healthy = server.status;
    const maintenance = server.maintenanceMode;

    // Status color mapping — traffic-light colors are an intentional
    // exception to the monochrome theme, scoped to server health only.
    const classes = healthy
        ? maintenance
            ? {
                  border: "border-status-yellow",
                  borderLight: "border-status-yellow/30",
                  bg: "bg-status-yellow/10",
                  bgLight: "bg-status-yellow/5",
                  hover: "group-hover:border-status-yellow",
                  text: "text-status-yellow",
                  shadow: "shadow-status-yellow/30",
              }
            : {
                  border: "border-status-green",
                  borderLight: "border-status-green/30",
                  bg: "bg-status-green/10",
                  bgLight: "bg-status-green/5",
                  hover: "group-hover:border-status-green",
                  text: "text-status-green",
                  shadow: "shadow-status-green/30",
              }
        : {
              border: "border-status-red",
              borderLight: "border-status-red/30",
              bg: "bg-status-red/10",
              bgLight: "bg-status-red/5",
              hover: "group-hover:border-status-red",
              text: "text-status-red",
              shadow: "shadow-status-red/30",
          };

    const selectedClass = selected
        ? `${classes.border} ${classes.bg}`
        : `${classes.borderLight} ${classes.bgLight} ${classes.hover}`;

    return (
        <div
            ref={ref}
            onClick={() => onSelect(server.id)}
            className="group relative flex-shrink-0 cursor-pointer pl-3"
        >
            <div
                className={`flex aspect-square items-center justify-center rounded-xl border p-3 transition shadow-lg ${classes.shadow} ${selectedClass} ${
                    pulsing ? "ring-2 ring-app-text/40" : ""
                }`}
            >
                <ServerIcon className={`h-5 w-5 ${classes.text}`} />
            </div>

            {healthy && !maintenance && handledRequests !== null && handledRequests !== undefined && (
                <div className="absolute top-0 right-0 z-20 flex -translate-y-1/3 translate-x-1/3">
                    <span className="absolute inset-0 rounded-full bg-status-green opacity-40"></span>
                    <span className="relative flex min-w-5 min-h-5 items-center justify-center rounded-full border-2 border-app-panel bg-status-green px-1 text-[0.625rem] font-bold leading-none text-app-bg shadow-lg">
                        {handledRequests > 999 ? "999+" : handledRequests}
                    </span>
                </div>
            )}

            <div className="pointer-events-none absolute right-full top-1/2 z-10 mr-3 w-48 -translate-y-1/2 rounded-xl border border-app-border-soft bg-app-panel p-3 text-left opacity-0 shadow-lg transition group-hover:opacity-100">
                <div className="flex justify-between">
                    <div className="text-xs font-semibold">
                        {server.id} - {server.name}
                    </div>
                    <span className={`text-xs ${classes.text}`}>
                        ● {healthy
                            ? maintenance
                                ? "Maintenance"
                                : "Healthy"
                            : "Unhealthy"}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-faint">
                    <span>Weight</span>
                    <span className="font-semibold text-app-text">
                        {server.weight !== null &&
                        server.weight !== undefined
                            ? server.weight
                            : 0}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-faint">
                    <span>Port</span>
                    <span className="font-semibold text-app-text">
                        {server.port !== null &&
                        server.port !== undefined
                            ? server.port
                            : 0}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-faint">
                    <span>Handled requests</span>
                    <span className="font-semibold text-app-text">
                        {handledRequests !== null &&
                        handledRequests !== undefined
                            ? handledRequests
                            : 0}
                    </span>
                </div>
            </div>
        </div>
    );
});

export default ServerNode;