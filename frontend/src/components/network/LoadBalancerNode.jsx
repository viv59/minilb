import { Shuffle } from "lucide-react";

export default function LoadBalancerNode() {
    return (
        <div className="flex aspect-square flex-shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-accent2/60 bg-gradient-to-br from-accent2/10 to-accent1/10 p-6 text-center text-sm font-bold shadow-lg shadow-accent2/30">
            <Shuffle className="h-5 w-5" />
            Load
            <br />
            Balancer
        </div>
    );
}