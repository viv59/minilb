import { X } from "lucide-react";

const VARIANTS = {
    success:
        "border-green-500/30 bg-green-500/10 text-green-400",
    error:
        "border-red-500/30 bg-red-500/10 text-red-400",
    warning:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    info:
        "border-accent1/30 bg-accent1/10 text-accent1",
};

export default function Toast({
    title,
    message,
    variant = "info",
    onClose,
}) {
    return (
        <div
            className={`toast-slide flex items-start justify-between gap-4 rounded-lg border px-4 py-3 shadow-xl backdrop-blur ${VARIANTS[variant]}`}
        >
            <div>
                <div className="font-semibold">{title}</div>
                <div className="text-sm opacity-80">{message}</div>
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