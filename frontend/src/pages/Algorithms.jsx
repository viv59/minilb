import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useServerStore } from '../store/serverStore.js'
import { useSettingsStore } from '../store/settingsStore.js'
import { ALGORITHM_OPTIONS } from '../utils/algorithms.js'

const CATEGORY_LABELS = {
  static: 'Static — fixed rules, no live metrics',
  dynamic: 'Dynamic — adapts to real-time load',
}
const CATEGORY_ORDER = ['static', 'dynamic']

export default function Algorithms() {
  const algorithmIndex = useServerStore((s) => s.algorithmIndex)
  const defaultAlgorithm = useSettingsStore((s) => s.defaultAlgorithm)

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: ALGORITHM_OPTIONS.filter((a) => a.category === category),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <h1 className="mb-5 text-lg font-semibold">Load Balancing Algorithms</h1>

      {grouped.map(({ category, items }) => (
        <div key={category} className="mb-7 last:mb-0">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-text-faint">
            {CATEGORY_LABELS[category] ?? category}
          </h2>

          <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
            {items.map((algo) => {
              const i = ALGORITHM_OPTIONS.indexOf(algo)
              // const isActive = i === algorithmIndex
              const isDefault = algo.value === defaultAlgorithm

              return (
                <Link
                  key={algo.value}
                  to={`/algorithms/${algo.value}`}
                  className="flex flex-col gap-3 rounded-xl border border-app-border-soft bg-app-panel p-4 transition hover:border-app-border"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-app-border-soft bg-app-panel-soft text-[11px] font-bold text-text-dim">
                      {algo.short_form}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-app-text">
                          {algo.label}
                        </h3>
                        {/* {isActive && (
                          <span className="rounded-full border border-app-border bg-white/5 px-2 py-0.5 text-[10px] text-app-text">
                            Active
                          </span>
                        )} */}
                        {isDefault && (
                          <span className="rounded-full border border-status-green bg-white/5 px-2 py-0.5 text-[10px] text-status-green">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-text-dim">
                        {algo.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={16}
                      className="mt-1 flex-shrink-0 text-text-faint"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {algo.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-app-border bg-white/5 px-2 py-0.5 text-[10px] text-text-dim"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}