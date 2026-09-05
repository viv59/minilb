import { useEffect } from "react";
import {
    Plus,
    SlidersHorizontal,
    RotateCcw,
} from "lucide-react";

import { useServerStore } from "../../store/serverStore.js";
import FilterConditionRow from "./FilterConditionRow.jsx";
import Button from "../common/Button.jsx";

export default function FilterBar() {
    const filterFields = useServerStore((s) => s.filterFields);
    const filterFieldsLoading = useServerStore(
        (s) => s.filterFieldsLoading
    );
    const conditions = useServerStore((s) => s.conditions);
    const filterActive = useServerStore((s) => s.filterActive);

    const fetchFilterFields = useServerStore(
        (s) => s.fetchFilterFields
    );
    const addCondition = useServerStore((s) => s.addCondition);
    const updateCondition = useServerStore(
        (s) => s.updateCondition
    );
    const removeCondition = useServerStore(
        (s) => s.removeCondition
    );
    const applyFilters = useServerStore((s) => s.applyFilters);
    const clearFilters = useServerStore((s) => s.clearFilters);

    useEffect(() => {
        fetchFilterFields();
    }, [fetchFilterFields]);

    if (filterFieldsLoading) {
        return (
            <div className="mb-5 rounded-lg border border-app-border bg-app-panel p-5">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 animate-pulse rounded bg-app-panel-soft/30" />

                    <div className="space-y-2">
                        <div className="h-3 w-28 animate-pulse rounded bg-app-panel-soft/30" />
                        <div className="h-2 w-40 animate-pulse rounded bg-app-panel-soft/20" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-5 overflow-hidden rounded-xl border border-app-border bg-app-panel shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-app-border px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-app-panel-soft/10 text-text-dim">
                        <SlidersHorizontal size={16} />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-app-text">
                                Filters
                            </h3>

                            {filterActive && (
                                <span className="rounded-full bg-app-panel-soft/10 px-2 py-0.5 text-[10px] font-medium text-text-dim">
                                    Active
                                </span>
                            )}
                        </div>

                        <p className="mt-0.5 text-xs text-text-dim">
                            Narrow down servers using one or more conditions
                        </p>
                    </div>
                </div>

                {filterActive && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="
                            flex items-center gap-1.5 rounded-md
                            px-2.5 py-1.5 text-xs text-text-dim
                            transition-colors
                            hover:bg-app-panel-soft/10 hover:text-text-dim
                        "
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                )}
            </div>

            {/* Conditions */}
            <div className="p-4">
                <div className="space-y-2">
                    {conditions.map((condition, i) => (
                        <FilterConditionRow
                            key={i}
                            condition={condition}
                            fieldOptions={filterFields}
                            canRemove={conditions.length > 1}
                            isFirst={i === 0}
                            onChange={(patch) =>
                                updateCondition(i, patch)
                            }
                            onRemove={() => removeCondition(i)}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex flex-col gap-3 border-t border-app-border pt-4 sm:flex-row sm:items-center">
                    <Button
                        onClick={addCondition}
                        variant="outline"
                    >
                        <Plus size={14} />
                        {/* <span>Add condition</span>> */}
                    </Button>

                    <div className="flex items-center gap-2 sm:ml-auto">
                        {filterActive && (
                            <Button
                                onClick={clearFilters}
                                variant="ghost"
                            >
                                Clear
                            </Button>
                        )}

                        <Button onClick={applyFilters}>
                            Apply filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}