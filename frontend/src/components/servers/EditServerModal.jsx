import { useEffect, useState } from "react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import { useServers } from "../../hooks/useServers.js";
import { useServerUI } from "../../context/ServerContext.jsx";
import { locationData } from "../../utils/constants.js";

const emptyForm = {
    name: "",
    hostname: "",
    ip: "",
    port: "",

    weight: "",
    priority: "",

    maxConnections: "",
    cpu: "",
    memory: "",

    region: "",
    country: "",
    datacenter: "",

    supportsStickySession: false,
};

export default function EditServerModal() {
    const { servers, updateServer } = useServers();
    const { modal, closeModal } = useServerUI();
    const open = modal?.type === "edit";
    const server = open ? servers.find((s) => s.id === modal.serverId) : null;

    const [form, setForm] = useState(emptyForm);
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

    useEffect(() => {
        if (server) {
            setForm({
                name: server.name ?? "",
                hostname: server.hostname ?? "",
                ip: server.ip ?? "",
                port: server.port ?? "",

                weight: server.weight ?? "",
                priority: server.priority ?? "",

                maxConnections: server.maxConnections ?? "",
                cpu: server.cpu ?? "",
                memory: server.memory ?? "",

                region: server.region ?? "",
                country: server.country ?? "",
                datacenter: server.datacenter ?? "",

                supportsStickySession: server.supportsStickySession ?? false,
                maintenanceMode: server.maintenanceMode,
            });
        }
    }, [server]);

    if (!open || !server) return null;

    function updateField(key) {
        return (v) => setForm((f) => ({ ...f, [key]: v }));
    }

    function handleClose() {
        setError(null);
        closeModal();
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            // Adjust these keys to match your backend's update-server schema exactly.
            await updateServer(server.id, {
                name: form.name,
                hostname: form.hostname || undefined,
                ip: form.ip || undefined,

                port: Number(form.port),

                weight: Number(form.weight),
                priority: Number(form.priority),

                max_connections: form.maxConnections
                    ? Number(form.maxConnections)
                    : undefined,

                cpu: form.cpu ? Number(form.cpu) : undefined,

                memory: form.memory ? Number(form.memory) : undefined,

                region: form.region || undefined,
                country: form.country || undefined,
                datacenter: form.datacenter || undefined,

                supports_sticky_session: form.supportsStickySession,
                maintenance_mode: form.maintenanceMode,
            });
            closeModal();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to save changes");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal open={open} title={`Edit ${server.name}`} onClose={handleClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-text-dim">
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
                        value={form.ip}
                        onChange={updateField("ip")}
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
                        value={form.maxConnections}
                        onChange={updateField("maxConnections")}
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
                        checked={form.supportsStickySession}
                        onChange={(e) =>
                            updateField("supportsStickySession")(
                                e.target.checked,
                            )
                        }
                        className="h-4 w-4 rounded border-app-border bg-[#0d0f1e] accent-accent1"
                    />
                    Supports Sticky Session
                </label>
                <label className="flex items-center gap-2 text-sm text-text-faint">
                    <input
                        type="checkbox"
                        checked={form.maintenanceMode}
                        onChange={(e) =>
                            updateField("maintenanceMode")(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-app-border bg-[#0d0f1e] accent-accent1"
                    />
                    Maintenance Mode
                </label>

                {error && <p className="text-xs text-status-red">{error}</p>}

                <div className="flex gap-2.5 pt-2">
                    <Button
                        type="button"
                        variant="outline"
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
                        {submitting ? "Saving…" : "Save Changes"}
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
