// src/components/network/ConnectionLine.jsx
export default function ConnectionLine({ className = "" }) {
    return (
        <svg
            className={`h-4 w-full flex-1 ${className}`}
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
        >
            <path
                d="M 0 5 L 100 5"
                vectorEffect="non-scaling-stroke"
                fill="none"
                stroke="#ffffff30"
                strokeWidth="1.6"
                strokeDasharray="2 6"
                strokeLinecap="round"
                className="animate-dash"
            />
        </svg>
    );
}