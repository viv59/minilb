import { X, Check, AlertTriangle, Info } from "lucide-react";

// Only "error" gets red. Success/warning/info are distinguished by icon +
// weight, not by color — that's what keeps the theme minimal.
const VARIANTS = {
    success: {
        classes: "border-app-border bg-app-panel text-app-text",
        icon: Check,
    },
    error: {
        classes: "border-accent/30 bg-accent/10 text-accent",
        icon: AlertTriangle,
    },
    warning: {
        classes: "border-text-dim/30 bg-app-text/5 text-text-dim",
        icon: AlertTriangle,
    },
    info: {
        classes: "border-app-border bg-app-panel text-text-dim",
        icon: Info,
    },
};

export default function Toast({
    title,
    message,
    variant = "info",
    onClose,
}) {
    const { classes, icon: Icon } = VARIANTS[variant];

    return (
        <div
            className={`toast-slide flex items-start justify-between gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur ${classes}`}
        >
            <div className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 shrink-0" />
                <div>
                    <div className="font-semibold text-app-text">{title}</div>
                    <div className="text-sm text-text-dim">{message}</div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="opacity-60 hover:opacity-100"
            >
                <X size={18} />
            </button>
        </div>
    );
}