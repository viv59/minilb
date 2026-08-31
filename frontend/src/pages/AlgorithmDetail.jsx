import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { useServerStore } from '../store/serverStore.js'
import { useSettingsStore } from '../store/settingsStore.js'
import { ALGORITHM_OPTIONS } from '../utils/algorithms.js'

export default function AlgorithmDetail() {
  const { algoValue } = useParams()
  const navigate = useNavigate()

  const algoIndex = ALGORITHM_OPTIONS.findIndex((a) => a.value === algoValue)
  const algo = ALGORITHM_OPTIONS[algoIndex]

  const activeIndex = useServerStore((s) => s.algorithmIndex)
  const setAlgorithmIndex = useServerStore((s) => s.setAlgorithmIndex)
  const defaultAlgorithm = useSettingsStore((s) => s.defaultAlgorithm)
  const setDefaultAlgorithm = useSettingsStore((s) => s.setDefaultAlgorithm)

  if (!algo) {
    return (
      <div>
        <Link to="/algorithms" className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-app-text">
          <ArrowLeft size={14} /> Back to algorithms
        </Link>
        <div className="mt-6 text-sm text-text-dim">
          Unknown algorithm "{algoValue}".
        </div>
      </div>
    )
  }

  const isActive = algoIndex === activeIndex
  const isDefault = algo.value === defaultAlgorithm

  return (
    <div className="max-w-2xl">
      <Link
        to="/algorithms"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-app-text"
      >
        <ArrowLeft size={14} /> Back to algorithms
      </Link>

      <div className="mb-1 flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-app-border-soft bg-app-panel text-xs font-bold text-text-dim">
          {algo.short_form}
        </span>
        <h1 className="text-lg font-semibold text-app-text">{algo.label}</h1>
        {isActive && (
          <span className="rounded-full border border-app-border px-2 py-0.5 text-[10px] text-app-text">
            Active
          </span>
        )}
        {isDefault && (
          <span className="rounded-full border border-status-green px-2 py-0.5 text-[10px] text-status-green">
            Default
          </span>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {algo.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-app-border-soft px-2 py-0.5 text-[10px] text-text-faint"
          >
            {tag}
          </span>
        ))}
      </div>

      <Card title="How it works">
        <p className="text-sm text-text-dim">{algo.longDescription ?? algo.description}</p>
      </Card>

      {algo.bestFor && (
        <Card title="Best for" className="mt-4">
          <p className="text-sm text-text-dim">{algo.bestFor}</p>
        </Card>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {/* <Button variant="outline" disabled={isActive} onClick={() => setAlgorithmIndex(algoIndex)}>
          {isActive ? 'Currently active' : 'Use this algorithm'}
        </Button> */}
        <Button variant="outline" disabled={isDefault} onClick={() => setDefaultAlgorithm(algo.value)}>
          {isDefault ? 'Default algorithm' : 'Set as default'}
        </Button>
        <Button onClick={() => navigate('/simulations', { state: { algorithm: algo.value } })}>
          Simulate with this
        </Button>
      </div>
    </div>
  )
}