// src/components/network/ServerNode.jsx
import { forwardRef } from "react";
import { Server as ServerIcon } from "lucide-react";

const ServerNode = forwardRef(function ServerNode(
    { server, selected, pulsing, handledRequests, onSelect },
    ref,
) {
    const healthy = server.status;

    const classes = healthy
        ? {
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
                    pulsing ? "ring-2 ring-accent2" : ""
                }`}
            >
                <ServerIcon className={`h-5 w-5 ${classes.text}`} />
            </div>

            {handledRequests !== null && handledRequests !== undefined && (
                <div className="absolute top-0 right-0 z-20 flex -translate-y-1/3 translate-x-1/3">
                    <span className="absolute inset-0 rounded-full bg-accent2 opacity-40"></span>
                    <span className="relative flex min-w-5 min-h-5 items-center justify-center rounded-full border-2 border-app-panel bg-accent2 px-1 text-[0.625rem] font-bold leading-none text-white shadow-lg">
                        {handledRequests > 999 ? "999+" : handledRequests}
                    </span>
                </div>
            )}

            <div className="pointer-events-none absolute right-full top-1/2 z-10 mr-3 w-48 -translate-y-1/2 rounded-xl border border-app-border-soft bg-app-panel p-3 text-left opacity-0 shadow-lg transition group-hover:opacity-100">
                <div className="flex justify-between">
                    <div className="truncate text-sm font-semibold">
                        {server.id} - {server.name}
                    </div>
                    <span className={`text-xs ${classes.text}`}>
                        ● {healthy ? "Healthy" : "Unhealthy"}
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
