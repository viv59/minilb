import { useState } from 'react'
import { Download } from 'lucide-react'
import { serverApi } from '../../api/serverApi.js'
import { useServers } from '../../hooks/useServers.js'
import { useServerUI } from '../../context/ServerContext.jsx'
import { useToastStore } from '../../store/ToastStore.js'

const EXAMPLE_SERVERS = [
  {
    name: "Web Server 1",
    hostname: "web1.internal",
    port: 8000,
    weight: 2,
    priority: 0,
    max_connections: 100,
    cpu: 4,
    memory: 8,
    region: "us-east",
    supports_sticky_session: true
  },
  {
    name: "Web Server 2",
    hostname: "web2.internal",
    port: 8000,
    weight: 1
  }
]

function downloadExampleJson() {
  const blob = new Blob([JSON.stringify(EXAMPLE_SERVERS, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'servers-template.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url) // release the object URL now that the download's triggered
}

export default function BulkUploadModal() {
  const { modal, closeModal } = useServerUI()
  const { fetchServers } = useServers()

  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  if (modal !== 'bulk-upload') return null

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const response = await serverApi.bulkUpload(file)
      setResult(response)
      if (response.succeeded > 0) {
        fetchServers()
      }
      useToastStore.getState().showToast({
        variant: response.failed === 0 ? 'success' : 'warning',
        message: `${response.succeeded} of ${response.total} servers added successfully.`,
      })
    } catch (err) {
      useToastStore.getState().showToast({
        variant: 'error',
        message: err.response?.data?.detail ?? 'Bulk upload failed',
      })
    } finally {
      setUploading(false)
    }
  }

  function handleClose() {
    setFile(null)
    setResult(null)
    closeModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-2xl border border-app-border-soft bg-app-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bulk Upload Servers</h2>
          <button
            onClick={downloadExampleJson}
            className="flex items-center gap-1.5 rounded-lg border border-app-border-soft px-2.5 py-1.5 text-xs text-text-faint transition hover:border-accent1/50 hover:text-accent1"
          >
            <Download size={13} /> Example JSON
          </button>
        </div>

        <p className="mb-3 text-xs text-text-faint">
          Upload a JSON file containing an array of server objects. Only{' '}
          <span className="font-semibold text-app-text">name</span> is required —
          download the example above for the full list of optional fields.
        </p>

        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-4 w-full rounded-lg border border-app-border-soft bg-transparent px-3 py-2 text-sm"
        />

        {result && (
          <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-app-border-soft p-3 text-xs">
            <div className="mb-2 font-semibold">
              {result.succeeded} succeeded, {result.failed} failed (of {result.total})
            </div>
            {result.results
              .filter((r) => !r.success)
              .map((r) => (
                <div key={r.index} className="text-status-red">
                  Row {r.index + 1} ({r.name ?? 'unnamed'}): {r.error}
                </div>
              ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded-lg border border-app-border-soft px-3 py-1.5 text-xs text-text-faint hover:text-app-text"
          >
            Close
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="rounded-lg border border-accent1/70 bg-accent1/10 px-3 py-1.5 text-xs font-semibold text-accent1 hover:bg-accent1/20 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}