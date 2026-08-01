import { X } from "lucide-react";

const OPERATOR_LABELS = {
    eq: "is",
    ne: "is not",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
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
}) {
    const fieldMeta = fieldOptions[condition.field];
    const availableOperators = fieldMeta?.operators ?? [];
    const fieldType = fieldMeta?.type;

    const handleFieldChange = (e) => {
        const field = e.target.value;
        // reset operator/value whenever the field changes, since the new
        // field's type may not support the previously selected operator
        onChange({
            field,
            operator: "",
            value: "",
            fieldType: fieldOptions[field]?.type,
        });
    };

    const handleOperatorChange = (e) => {
        onChange({ operator: e.target.value, value: "" });
    };

    const handleValueChange = (value) => onChange({ value });

    return (
        <div className="flex items-center gap-2">
            <select
                className="rounded border border-app-border bg-[#0d0f1e] px-2 py-1.5 text-sm min-w-[140px]"
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

            <select
                className="rounded border border-app-border bg-[#0d0f1e] px-2 py-1.5 text-sm min-w-[120px]"
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

            <ValueInput
                fieldType={fieldType}
                operator={condition.operator}
                value={condition.value}
                onChange={handleValueChange}
            />

            <button
                type="button"
                onClick={onRemove}
                disabled={!canRemove}
                className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400"
                aria-label="Remove condition"
            >
                <X size={16} />
            </button>
        </div>
    );
}

function ValueInput({ fieldType, operator, value, onChange }) {
    if (!operator || operator === "is_null") {
        return (
            <div className="min-w-[160px] text-sm text-gray-400 px-2">
                — no value needed —
            </div>
        );
    }

    if (fieldType === "boolean") {
        return (
            <select
                className="rounded border border-app-border bg-[#0d0f1e] px-2 py-1.5 text-sm min-w-[160px]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Select…</option>
                <option value="true">True</option>
                <option value="false">False</option>
            </select>
        );
    }

    if (operator === "in" || operator === "not_in") {
        return (
            <input
                type="text"
                className="rounded border border-app-border px-2 py-1.5 text-sm min-w-[160px] bg-[#0d0f1e]"
                placeholder="comma,separated,values"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (operator === "between") {
        return (
            <input
                type="text"
                className="rounded border border-app-border px-2 py-1.5 text-sm min-w-[160px] bg-[#0d0f1e]"
                placeholder={
                    fieldType === "number" ? "e.g. 10, 50" : "low, high"
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
                className="rounded border border-app-border px-2 py-1.5 text-sm min-w-[160px] bg-[#0d0f1e]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (fieldType === "date") {
        return (
            <input
                type="datetime-local"
                className="rounded border border-app-border px-2 py-1.5 text-sm min-w-[160px] bg-[#0d0f1e]"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <input
            type="text"
            className="rounded border border-app-border px-2 py-1.5 text-sm min-w-[160px] bg-[#0d0f1e]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}
