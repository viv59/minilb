import Card from '../components/common/Card.jsx'
import { ALGORITHMS } from '../utils/algorithms.js'
import { useServerStore } from '../store/serverStore.js'

export default function Algorithms() {
  const algorithmIndex = useServerStore((s) => s.algorithmIndex)
  const setAlgorithmIndex = useServerStore((s) => s.setAlgorithmIndex)

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Load Balancing Algorithms</h1>
      <div className="grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
        {ALGORITHMS.map((algo, i) => (
          <Card key={algo.id} className={i === algorithmIndex ? 'border-accent1' : ''}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{algo.name}</h3>
              {i === algorithmIndex && <span className="text-xs text-accent1">Active</span>}
            </div>
            <p className="mt-2 text-xs text-text-dim">{algo.description}</p>
            {i !== algorithmIndex && (
              <button onClick={() => setAlgorithmIndex(i)} className="mt-3.5 text-xs text-accent2 hover:underline">
                Use this algorithm
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
