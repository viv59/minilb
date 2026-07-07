// src/components/network/NetworkDiagram.jsx
import { useLayoutEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import InfiniteGrid from "./InfiniteGrid.jsx";
import ConnectionLine from "./ConnectionLine.jsx";
import LoadBalancerNode from "./LoadBalancerNode.jsx";
import ServerNode from "./ServerNode.jsx";
import { useServers } from "../../hooks/useServers.js";
import { useServerUI } from "../../context/ServerContext.jsx";
import { useSimulation } from "../../hooks/useSimulation.js";

function normalizeValue(value) {
    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
}

function findServerId(servers, serverName) {
    const direct = servers.find(
        (s) => s.name === serverName || s.id === serverName,
    );
    if (direct) return direct.id;

    const num = serverName?.match(/(\d+)/)?.[1];
    if (num) {
        const idx = Number(num) - 1;
        return servers[idx]?.id ?? null;
    }
    return null;
}

function getHandledRequests(server, distribution) {
    if (!distribution || typeof distribution !== "object") return null;

    const directKeys = [server.name, server.id, String(server.id)];
    for (const key of directKeys) {
        if (distribution[key] !== undefined) return distribution[key];
    }

    const normalizedServerName = normalizeValue(server.name);
    const match = Object.keys(distribution).find(
        (key) => normalizeValue(key) === normalizedServerName,
    );

    return match !== undefined ? distribution[match] : null;
}

export default function NetworkDiagram() {
    const { servers } = useServers();
    const { selectedId, setSelectedId } = useServerUI();
    const { distribution } = useSimulation();

    const containerRef = useRef(null);
    const lbRef = useRef(null);
    const serverRefs = useRef({});

    const [size, setSize] = useState({ width: 0, height: 0 });
    const [paths, setPaths] = useState([]);

    function measure() {
        const container = containerRef.current;
        const lb = lbRef.current;
        if (!container || !lb) return;

        const containerBox = container.getBoundingClientRect();
        const lbBox = lb.getBoundingClientRect();

        const startX = lbBox.right - containerBox.left;
        const startY = lbBox.top + lbBox.height / 2 - containerBox.top;

        const nextPaths = servers
            .filter((s) => s.status)
            .map((s) => {
                const el = serverRefs.current[s.id];
                if (!el) return null;
                const box = el.getBoundingClientRect();
                const endX = box.left - containerBox.left;
                const endY = box.top + box.height / 2 - containerBox.top;
                const midX = (startX + endX) / 2;
                return {
                    id: s.id,
                    d: `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`,
                };
            })
            .filter(Boolean);

        setPaths(nextPaths);
        setSize({ width: containerBox.width, height: containerBox.height });
    }

    useLayoutEffect(() => {
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [servers.length]);

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden rounded-2xl border border-app-border-soft bg-app-panel p-10"
        >
            <InfiniteGrid />

            <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
                preserveAspectRatio="none"
            >
                {paths.map((p) => (
                    <path
                        key={p.id}
                        d={p.d}
                        fill="none"
                        stroke="#ffffff30"
                        strokeWidth="1.6"
                        strokeDasharray="2 6"
                        strokeLinecap="round"
                        className="animate-dash"
                    />
                ))}
            </svg>

            <div className="relative grid grid-cols-1 items-center justify-items-center gap-6 md:grid-cols-[auto_1fr_auto_1fr_auto] md:justify-items-stretch">
                <div className="flex aspect-square flex-shrink-0 flex-col items-center justify-center gap-1 rounded-full border border-accent1/70 bg-accent1/10 p-6 text-center text-xs font-semibold shadow-lg shadow-accent1/30">
                    <Globe className="h-5 w-5" />
                    Incoming
                    <br />
                    Traffic
                </div>

                <ConnectionLine className="hidden md:block" />

                <div
                    ref={lbRef}
                    className="flex flex-shrink-0 justify-self-center pr-6"
                >
                    <LoadBalancerNode />
                </div>

                <div className="hidden md:block" />

                <div className="flex flex-shrink-0 flex-col items-center gap-3 justify-self-center md:justify-self-end pl-3">
                    {servers.map((s) => (
                        <ServerNode
                            key={s.id}
                            ref={(el) => {
                                serverRefs.current[s.id] = el;
                            }}
                            server={s}
                            selected={s.id === selectedId}
                            handledRequests={getHandledRequests(
                                s,
                                distribution,
                            )}
                            onSelect={setSelectedId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
