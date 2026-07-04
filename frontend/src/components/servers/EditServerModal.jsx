import { useEffect, useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import { useServers } from '../../hooks/useServers.js'
import { useServerUI } from '../../context/ServerContext.jsx'

export default function EditServerModal() {
  const { servers, updateServer } = useServers()
  const { modal, closeModal } = useServerUI()
  const open = modal?.type === 'edit'
  const server = open ? servers.find((s) => s.id === modal.serverId) : null

  const [form, setForm] = useState({ name: '', ip: '', port: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (server) setForm({ name: server.name, ip: server.ip, port: server.port })
  }, [server])

  if (!open || !server) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await updateServer(server.id, { name: form.name, ip: form.ip, port: Number(form.port) })
      closeModal()
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Failed to save changes')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title={`Edit ${server.name}`} onClose={closeModal}>
      <form onSubmit={handleSubmit} className="space-y-3.5 text-text-dim">
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="IP Address" value={form.ip} onChange={(v) => setForm({ ...form, ip: v })} />
        <Field label="Port" value={form.port} onChange={(v) => setForm({ ...form, port: v })} type="number" />
        {error && <p className="text-xs text-status-red">{error}</p>}
        <div className="flex gap-2.5 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-text-faint">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-app-border bg-[#0d0f1e] px-3 py-2 text-sm outline-none focus:border-accent1"
      />
    </div>
  )
}
