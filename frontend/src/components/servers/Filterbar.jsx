import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useServerStore } from '../../store/serverStore.js'
import FilterConditionRow from './FilterConditionRow.jsx'
import Button from '../common/Button.jsx'

export default function FilterBar() {
  const filterFields = useServerStore((s) => s.filterFields)
  const filterFieldsLoading = useServerStore((s) => s.filterFieldsLoading)
  const conditions = useServerStore((s) => s.conditions)
  const filterActive = useServerStore((s) => s.filterActive)
  const fetchFilterFields = useServerStore((s) => s.fetchFilterFields)
  const addCondition = useServerStore((s) => s.addCondition)
  const updateCondition = useServerStore((s) => s.updateCondition)
  const removeCondition = useServerStore((s) => s.removeCondition)
  const applyFilters = useServerStore((s) => s.applyFilters)
  const clearFilters = useServerStore((s) => s.clearFilters)

  useEffect(() => {
    fetchFilterFields()
  }, [fetchFilterFields])

  if (filterFieldsLoading) {
    return <div className="text-sm text-gray-400 mb-4">Loading filters…</div>
  }

  return (
    <div className="mb-5 rounded-lg border border-app-panel bg-app-panel p-4">
      <div className="flex flex-col gap-2">
        {conditions.map((condition, i) => (
          <FilterConditionRow
            key={i}
            condition={condition}
            fieldOptions={filterFields}
            canRemove={conditions.length > 1}
            onChange={(patch) => updateCondition(i, patch)}
            onRemove={() => removeCondition(i)}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {/* <button
          type="button"
          onClick={addCondition}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <Plus size={14} /> Add condition
        </button> */}
        <Button onClick={addCondition} variant="outline">
                <Plus size={14}/>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          {filterActive && (
            <Button onClick={clearFilters} variant='ghost'>
                Clear
            </Button>
          )}
          <Button onClick={applyFilters}>Apply filters</Button>
        </div>
      </div>
    </div>
  )
}