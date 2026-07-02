import { Shuffle } from 'lucide-react'

export default function LoadBalancerNode() {
  return (
    <div
      className="absolute flex h-[120px] w-[120px] flex-col items-center justify-center gap-1.5 rounded-[20px] border border-accent2/60 bg-gradient-to-br from-accent2/10 to-accent1/10 text-center text-[13.5px] font-bold shadow-[0_0_34px_-6px_#4fd1ff55]"
      style={{ left: 250, top: 220 }}
    >
      <Shuffle size={20} />
      Load
      <br />
      Balancer
    </div>
  )
}
