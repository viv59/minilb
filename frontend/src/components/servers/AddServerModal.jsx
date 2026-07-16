import { useState } from "react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import { useServers } from "../../hooks/useServers.js";
import { useServerUI } from "../../context/ServerContext.jsx";
import { locationData } from "../../utils/constants.js";

const initialForm = {
    name: "",
    hostname: "",
    ip_address: "",
    port: 8000,

    weight: 1,
    priority: 0,

    max_connections: "",
    cpu: "",
    memory: "",

    region: "",
    country: "",
    datacenter: "",

    supports_sticky_session: false,
};

export default function AddServerModal() {
    const { addServer } = useServers();
    const { modal, closeModal } = useServerUI();
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const regions = Object.keys(locationData);
    const countries = form.region
        ? Object.keys(locationData[form.region] || {})
        : [];
    const datacenters =
        form.region && form.country
            ? locationData[form.region][form.country] || []
            : [];

    function handleRegionChange(region) {
        setForm((f) => ({ ...f, region, country: "", datacenter: "" }));
    }

    function handleCountryChange(country) {
        setForm((f) => ({ ...f, country, datacenter: "" }));
    }

    const open = modal === "add";

    function updateField(key) {
        return (v) => setForm((f) => ({ ...f, [key]: v }));
    }

    function handleClose() {
        setForm(initialForm);
        setError(null);
        closeModal();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            // Adjust these keys to match your backend's create-server schema exactly.
            await addServer({
                name: form.name,
                hostname: form.hostname || undefined,
                ip_address: form.ip_address || undefined,

                port: Number(form.port),

                weight: Number(form.weight),
                priority: Number(form.priority),

                max_connections: form.max_connections
                    ? Number(form.max_connections)
                    : undefined,

                cpu: form.cpu ? Number(form.cpu) : undefined,

                memory: form.memory ? Number(form.memory) : undefined,

                region: form.region || undefined,
                country: form.country || undefined,
                datacenter: form.datacenter || undefined,

                supports_sticky_session: form.supports_sticky_session,
            });
            setForm(initialForm);
            closeModal();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to add server");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal open={open} title="Add Server" onClose={handleClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-text-faint">
                <Row>
                    <Field
                        label="Name"
                        value={form.name}
                        required
                        onChange={updateField("name")}
                    />
                    <Field
                        label="Hostname"
                        value={form.hostname}
                        onChange={updateField("hostname")}
                    />
                    <Field
                        label="IP Address"
                        value={form.ip_address}
                        onChange={updateField("ip_address")}
                    />
                </Row>

                <Row>
                    <Field
                        label="Port"
                        type="number"
                        value={form.port}
                        onChange={updateField("port")}
                    />
                    <Field
                        label="Weight"
                        type="number"
                        value={form.weight}
                        onChange={updateField("weight")}
                    />
                    <Field
                        label="Priority"
                        type="number"
                        value={form.priority}
                        onChange={updateField("priority")}
                    />
                </Row>

                <Row>
                    <Field
                        label="Max Conn"
                        type="number"
                        value={form.max_connections}
                        onChange={updateField("max_connections")}
                    />
                    <Field
                        label="CPU"
                        type="number"
                        value={form.cpu}
                        onChange={updateField("cpu")}
                    />
                    <Field
                        label="Memory"
                        type="number"
                        value={form.memory}
                        onChange={updateField("memory")}
                    />
                </Row>

                <Row>
                    <Select
                        label="Region"
                        value={form.region}
                        onChange={handleRegionChange}
                        options={regions}
                    />
                    <Select
                        label="Country"
                        value={form.country}
                        onChange={handleCountryChange}
                        options={countries}
                        disabled={!form.region}
                    />
                    <Select
                        label="Datacenter"
                        value={form.datacenter}
                        onChange={updateField("datacenter")}
                        options={datacenters}
                        disabled={!form.country}
                    />
                </Row>

                <label className="flex items-center gap-2 text-sm text-text-faint">
                    <input
                        type="checkbox"
                        checked={form.supports_sticky_session}
                        onChange={(e) =>
                            updateField("supports_sticky_session")(
                                e.target.checked,
                            )
                        }
                        className="h-4 w-4 rounded border-app-border bg-[#0d0f1e] accent-accent1"
                    />
                    Supports Sticky Session
                </label>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={submitting}
                    >
                        {submitting ? "Adding…" : "Add Server"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

function Row({ children }) {
    return <div className="grid grid-cols-3 gap-3">{children}</div>;
}

function Field({ label, value, onChange, type = "text", required = false }) {
    return (
        <div>
            <label className="mb-1.5 block text-xs text-text-faint">
                {label}
            </label>
            <input
                type={type}
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-app-border bg-[#0d0f1e] px-3 py-2 text-sm outline-none focus:border-accent1"
            />
        </div>
    );
}

function Select({
    label,
    value,
    onChange,
    options,
    disabled = false,
    required = false,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs text-text-faint">
                {label}
            </label>
            <select
                value={value}
                required={required}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-app-border bg-[#0d0f1e] px-3 py-2 text-sm outline-none focus:border-accent1 disabled:opacity-50"
            >
                <option value="">Select…</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
}
