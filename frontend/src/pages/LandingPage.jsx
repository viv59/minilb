import { Link } from "react-router-dom";
import {
    Hexagon,
    Server as ServerIcon,
    Globe,
    ArrowRight,
} from "lucide-react";
import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import { ALGORITHM_OPTIONS } from "../utils/algorithms.js"; 
import { FEATURES } from "../utils/constants.js";

// Swap these for your real ALGORITHM_OPTIONS (utils/algorithms.js) if you
// want the badges to reflect exactly what the app supports.



// Currently unused (HeroDiagram is disabled below) — kept here so it's a
// one-line uncomment to bring back, rather than rebuilding it later.
function DiagramNode({ icon: Icon, tone = "neutral", label, className = "" }) {
    const toneClasses = {
        neutral: "border-app-border-soft bg-app-panel text-app-text",
        inverted: "border-app-text bg-app-text text-black",
        green: "border-status-green/40 bg-status-green/10 text-status-green",
        yellow: "border-status-yellow/40 bg-status-yellow/10 text-status-yellow",
    }[tone];

    return (
        <div className={`absolute flex flex-col items-center gap-1.5 ${className}`}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-lg shadow-black/30 ${toneClasses}`}>
                <Icon size={18} />
            </div>
            {label && <span className="text-[10px] uppercase tracking-wide text-text-faint">{label}</span>}
        </div>
    );
}

function HeroDiagram() {
    return (
        <div className="relative mx-auto h-[260px] w-full max-w-md">
            <svg
                viewBox="0 0 400 260"
                className="absolute inset-0 h-full w-full motion-reduce:[&_path]:animate-none"
                fill="none"
            >
                <path d="M60 130 H180" stroke="rgb(var(--color-border))" strokeWidth="2" strokeDasharray="5 9" className="animate-dash" />
                <path d="M240 130 C 280 130, 280 55, 320 55" stroke="rgb(var(--color-status-green))" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="5 9" className="animate-dash" />
                <path d="M240 130 H320" stroke="rgb(var(--color-status-green))" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="5 9" className="animate-dash" />
                <path d="M240 130 C 280 130, 280 205, 320 205" stroke="rgb(var(--color-status-yellow))" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="5 9" className="animate-dash" />
            </svg>

            <DiagramNode icon={Globe} label="Client" className="left-0 top-1/2 -translate-y-1/2" />
            <DiagramNode icon={Hexagon} tone="inverted" label="miniLB" className="left-[180px] top-1/2 -translate-y-1/2" />
            <DiagramNode icon={ServerIcon} tone="green" label="Healthy" className="left-[320px] top-[55px] -translate-y-1/2" />
            <DiagramNode icon={ServerIcon} tone="green" label="Healthy" className="left-[320px] top-1/2 -translate-y-1/2" />
            <DiagramNode icon={ServerIcon} tone="yellow" label="Maintenance" className="left-[320px] top-[205px] -translate-y-1/2" />
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-app-bg text-app-text">
            {/* Nav */}
            <header className="flex items-center justify-between px-6 py-5 sm:px-10">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-app-text">
                        <Hexagon size={16} className="text-black" />
                    </div>
                    <span className="text-sm font-semibold font-mono tracking-tight">miniLB</span>
                </div>
                <Link to="/simulations">
                    <Button variant="outline" className="text-xs">
                        Start Now!
                    </Button>
                </Link>
            </header>

            {/* Hero — single centered column while HeroDiagram is disabled.
                If you re-enable HeroDiagram, wrap this div and <HeroDiagram />
                in a parent with `grid grid-cols-1 items-center gap-12 lg:grid-cols-2`. */}
            <section className="mx-auto max-w-2xl px-6 py-16 text-center sm:px-10 lg:py-24">
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-faint">
                    Load balancer simulator
                </span>
                <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                    Watch traffic decisions
                    <br />
                    before you make them.
                </h1>
                <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-text-dim">
                    miniLB simulates load-balancing algorithms against live server health, so you can see
                    exactly how requests would route — before that config ever touches production.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link to="/dashboard">
                        <Button className="flex items-center gap-1.5">
                            Open Dashboard <ArrowRight size={15} />
                        </Button>
                    </Link>
                    <Link to="/simulation-logs">
                        <Button variant="ghost">View simulation logs</Button>
                    </Link>
                </div>

                {/* <HeroDiagram /> */}
            </section>

            {/* Status legend — same colors the app uses, explained once */}
            <section className="border-y border-app-border-soft bg-app-panel/40">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-6 sm:px-10">
                    {[
                        { tone: "status-green", label: "Healthy", body: "Serving traffic normally" },
                        { tone: "status-yellow", label: "Maintenance", body: "Deliberately taken offline" },
                        { tone: "status-red", label: "Unhealthy", body: "Failing checks, excluded from routing" },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2.5">
                            <span className={`h-2 w-2 rounded-full bg-${s.tone}`} />
                            <span className="text-sm font-medium text-app-text">{s.label}</span>
                            <span className="text-xs text-text-faint"> {s.body}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ icon: Icon, title, body }) => (
                        <Card key={title} className="flex flex-col gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-border-soft bg-app-panel-soft text-app-text">
                                <Icon size={16} />
                            </div>
                            <div className="text-sm font-semibold text-app-text">{title}</div>
                            <p className="text-[13px] leading-relaxed text-text-dim">{body}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Algorithms */}
            <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
                <div className="rounded-2xl border border-app-border-soft bg-app-panel p-6">
                    <div className="text-[11px] uppercase tracking-wide text-text-faint">
                        Supported algorithms
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {ALGORITHM_OPTIONS.map((name,i) => (
                            <span
                                key={name.label}
                                className="rounded-full border border-app-border px-3 py-1 font-mono text-[11px] text-text-dim"
                            >
                                {name.label}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-6xl px-6 pb-20 text-center sm:px-10">
                <h2 className="text-2xl font-semibold tracking-tight">
                    See your fleet the way your traffic sees it.
                </h2>
                <Link to="/dashboard" className="mt-6 inline-block">
                    <Button className="flex items-center gap-1.5">
                        Open Dashboard <ArrowRight size={15} />
                    </Button>
                </Link>
            </section>

            <footer className="border-t border-app-border-soft py-6 text-center text-[11px] text-text-faint">
                Made with 🧡 by Vivek Gaikwad
            </footer>
        </div>
    );
}