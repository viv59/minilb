import { useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import { useServers } from '../../hooks/useServers.js'
import { useServerUI } from '../../context/ServerContext.jsx'

export default function AddServerModal() {
  const { addServer } = useServers()
  const { modal, closeModal } = useServerUI()
  const [form, setForm] = useState({ name: '', ip: '', port: '', cpu: '', memory: '', weight: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const open = modal === 'add'

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // Adjust these keys to match your backend's create-server schema exactly.
      await addServer({
        name: form.name,
        ip: form.ip,
        port: form.port ? Number(form.port) : undefined,
        cpu: form.cpu,
        memory: form.memory,
        weight: form.weight ? Number(form.weight) : 1
      })
      setForm({ name: '', ip: '', port: '' })
      closeModal()
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Failed to add server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title="Add Server" onClose={closeModal}>
      <form onSubmit={handleSubmit} className="space-y-3.5 text-text-dim">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field label="IP Address" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
        <Field label="Port" value={form.port} onChange={(v) => setForm({ ...form, port: v })} type="number" />
        <Field label="CPU" value={form.cpu} onChange={(v) => setForm({ ...form, cpu: v })} type="number" />
        <Field label="Memory" value={form.memory} onChange={(v) => setForm({ ...form, memory: v })} />
        <Field label="Weight" value={form.weight} onChange={(v) => setForm({ ...form, weight: v})} type="number"/>
        {error && <p className="text-xs text-status-red">{error}</p>}
        <div className="flex gap-2.5 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Server'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-faint">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-app-border bg-[#0d0f1e] px-3 py-2 text-sm outline-none focus:border-accent1"
      />
    </div>
  )
}
