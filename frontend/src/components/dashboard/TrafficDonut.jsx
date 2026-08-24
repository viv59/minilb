import { useRef, useState } from "react";
import Card from "../common/Card.jsx";
import { useStatistics } from "../../hooks/useStatistics.js";
import { getServerColor } from "../../utils/algorithms.js";

export default function TrafficDonut() {
    const { stats, loading } = useStatistics();
    const donutRef = useRef(null);
    const [hovered, setHovered] = useState(null); // { name, pct, requests, x, y }

    if (loading || !stats) {
        return <Card title="Traffic Distribution">Loading...</Card>;
    }

    const distributionObj = stats.distribution || {};
    const totalRequests = stats.total_requests || 0;

    const entries = Object.entries(distributionObj);

    let current = 0;

    const distribution = entries.map(([name, requests], index) => {
        const pct =
            totalRequests > 0
                ? Number(((requests / totalRequests) * 100).toFixed(1))
                : 0;

        const start = current;
        current += pct;

        return {
            id: name,
            name,
            requests,
            pct,
            start,
            end: current,
            color: getServerColor(name),
        };
    });

    const gradient =
        distribution.length > 0
            ? `conic-gradient(${distribution
                  .map((d) => `${d.color} ${d.start}% ${d.end}%`)
                  .join(",")})`
            : "#374151";

    const handleMouseMove = (e) => {
        const el = donutRef.current;
        if (!el || distribution.length === 0) return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const radius = rect.width / 2;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);

        // Hole is a 20% inset (matches inset-[20%] below), so ignore anything inside that
        const innerRadius = radius * 0.6;
        if (distFromCenter < innerRadius || distFromCenter > radius) {
            setHovered(null);
            return;
        }

        // Angle from top (12 o'clock), clockwise, 0-100%
        let angleDeg = (Math.atan2(dx, -dy) * 180) / Math.PI;
        if (angleDeg < 0) angleDeg += 360;
        const pctPos = (angleDeg / 360) * 100;

        const segment = distribution.find(
            (d) => pctPos >= d.start && pctPos < d.end
        );

        if (segment) {
            setHovered({
                name: segment.name,
                pct: segment.pct,
                requests: segment.requests,
                x: e.clientX,
                y: e.clientY,
            });
        } else {
            setHovered(null);
        }
    };

    return (
        <Card title="Traffic Distribution">
            <div className="flex h-full flex-col">
                <div className="flex flex-1 items-center gap-4">
                    {/* Donut — 40% */}
                    <div className="flex w-[40%] items-center justify-center">
                        <div
                            ref={donutRef}
                            className="relative aspect-square w-full max-w-[160px] rounded-full cursor-pointer"
                            style={{ background: gradient }}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <div className="absolute inset-[20%] flex items-center justify-center rounded-full bg-app-panel px-2 text-center text-[10px] text-text-dim">
                                {hovered ? hovered.name : null}
                            </div>
                        </div>
                    </div>

                    {/* Legend — 60% */}
                    <div className="flex w-[60%] flex-col justify-center gap-2.5 text-xs mb-2">
                        {distribution.map((d) => (
                            <div
                                key={d.id}
                                className={`flex items-center justify-between gap-3 transition-opacity ${
                                    hovered && hovered.name !== d.name
                                        ? "opacity-40"
                                        : "opacity-100"
                                }`}
                            >
                                <span className="flex min-w-0 items-center gap-2 text-text-dim">
                                    <span
                                        className="h-2 w-2 flex-shrink-0 rounded-full"
                                        style={{ background: d.color }}
                                    />
                                    <span className="truncate">{d.name}</span>
                                </span>

                                <span className="flex-shrink-0">{d.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <div className="mb-6 flex items-center justify-between border-t border-app-border-soft pt-3.5 text-sm">
                    <span className="text-text-faint">
                        Total Requests Processed
                    </span>

                    <span className="text-sm font-bold">
                        {totalRequests.toLocaleString()}
                    </span>
                </div> */}
            </div>

            {hovered && (
                <div
                    className="fixed z-50 pointer-events-none rounded-md border border-app-border-soft bg-app-panel px-2.5 py-1.5 text-xs shadow-lg"
                    style={{
                        left: hovered.x + 12,
                        top: hovered.y + 12,
                    }}
                >
                    <div className="font-semibold">{hovered.name}</div>
                    <div className="text-text-faint">
                        {hovered.requests.toLocaleString()} req · {hovered.pct}%
                    </div>
                </div>
            )}
        </Card>
    );
}