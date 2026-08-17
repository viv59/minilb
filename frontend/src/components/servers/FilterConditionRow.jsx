import { X, GripVertical } from "lucide-react";

const OPERATOR_LABELS = {
    eq: "is",
    ne: "is not",
    gt: "greater than",
    gte: "greater than or equal to",
    lt: "less than",
    lte: "less than or equal to",
    in: "is any of",
    not_in: "is none of",
    like: "contains",
    starts_with: "starts with",
    ends_with: "ends with",
    is_null: "is empty",
    between: "is between",
};

export default function FilterConditionRow({
    condition,
    fieldOptions,
    onChange,
    onRemove,
    canRemove,
    isFirst = false,
}) {
    const fieldMeta = fieldOptions[condition.field];
    const availableOperators = fieldMeta?.operators ?? [];
    const fieldType = fieldMeta?.type;

    const handleFieldChange = (e) => {
        const field = e.target.value;

        onChange({
            field,
            operator: "",
            value: "",
            fieldType: fieldOptions[field]?.type,
        });
    };

    const handleOperatorChange = (e) => {
        onChange({
            operator: e.target.value,
            value: "",
        });
    };

    const handleValueChange = (value) => {
        onChange({ value });
    };

    return (
        <div className="flex items-stretch gap-2">
            {/* AND indicator */}
            <div className="hidden sm:flex w-14 shrink-0 items-center justify-center">
                {isFirst ? (
                    <span className="text-xs font-medium text-gray-500">
                        WHERE
                    </span>
                ) : (
                    <span className="rounded-full border border-app-border bg-app-panel px-2 py-0.5 text-[10px] font-semibold tracking-wide text-gray-500">
                        AND
                    </span>
                )}
            </div>

            {/* Condition */}
            <div className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-app-border bg-app-panel/60 p-2 transition-colors hover:border-gray-500/40">
                {/* Drag / condition indicator */}
                <div className="hidden sm:flex shrink-0 items-center text-gray-600">
                    <GripVertical size={15} />
                </div>

                {/* Field */}
                <div className="min-w-0 flex-1">
                    <select
                        className="
                            w-full rounded-md border border-app-border
                            bg-app-panel px-3 py-2 text-sm text-gray-200
                            outline-none transition
                            hover:border-gray-500/60
                            focus:border-gray-400
                            focus:ring-1 focus:ring-gray-500/30
                        "
                        value={condition.field}
                        onChange={handleFieldChange}
                    >
                        <option value="">Select field</option>

                        {Object.keys(fieldOptions).map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Operator */}
                <div className="min-w-0 flex-1">
                    <select
                        className="
                            w-full rounded-md border border-app-border
                            bg-app-panel px-3 py-2 text-sm text-gray-200
                            outline-none transition
                            hover:border-gray-500/60
                            focus:border-gray-400
                            focus:ring-1 focus:ring-gray-500/30
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                        value={condition.operator}
                        onChange={handleOperatorChange}
                        disabled={!condition.field}
                    >
                        <option value="">Select operator</option>

                        {availableOperators.map((op) => (
                            <option key={op} value={op}>
                                {OPERATOR_LABELS[op] ?? op}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Value */}
                <div className="min-w-0 flex-[1.25]">
                    <ValueInput
                        fieldType={fieldType}
                        operator={condition.operator}
                        value={condition.value}
                        onChange={handleValueChange}
                    />
                </div>

                {/* Remove */}
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="
                        shrink-0 rounded-md p-2
                        text-gray-500 transition-colors
                        hover:bg-red-500/10 hover:text-red-400
                        disabled:cursor-not-allowed
                        disabled:opacity-20
                        disabled:hover:bg-transparent
                        disabled:hover:text-gray-500
                    "
                    aria-label="Remove condition"
                    title="Remove condition"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

function ValueInput({ fieldType, operator, value, onChange }) {
    const baseClass = `
        w-full rounded-md border border-app-border
        bg-app-panel px-3 py-2 text-sm text-gray-200
        outline-none transition
        placeholder:text-gray-600
        hover:border-gray-500/60
        focus:border-gray-400
        focus:ring-1 focus:ring-gray-500/30
    `;

    if (!operator) {
        return (
            <div
                className="
                    flex h-[38px] w-full items-center
                    rounded-md border border-dashed border-app-border
                    px-3 text-sm text-gray-600
                "
            >
                Select operator first
            </div>
        );
    }

    if (operator === "is_null") {
        return (
            <div
                className="
                    flex h-[38px] w-full items-center
                    rounded-md bg-gray-500/5 px-3
                    text-sm text-gray-500
                "
            >
                No value required
            </div>
        );
    }

    if (fieldType === "boolean") {
        return (
            <select
                className={baseClass}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select value</option>
                <option value="true">True</option>
                <option value="false">False</option>
            </select>
        );
    }

    if (operator === "in" || operator === "not_in") {
        return (
            <input
                type="text"
                className={baseClass}
                placeholder="value1, value2, value3"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (operator === "between") {
        return (
            <input
                type="text"
                className={baseClass}
                placeholder={
                    fieldType === "number"
                        ? "10, 50"
                        : "low, high"
                }
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (fieldType === "number") {
        return (
            <input
                type="number"
                className={baseClass}
                placeholder="Enter value"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (fieldType === "date") {
        return (
            <input
                type="datetime-local"
                className={baseClass}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <input
            type="text"
            className={baseClass}
            placeholder="Enter value"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}