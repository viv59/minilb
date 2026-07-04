import { Plus } from 'lucide-react'
import Button from '../common/Button.jsx'
import { useServerUI } from '../../context/ServerContext.jsx'

export default function TopBar() {
  const { openAddModal } = useServerUI()

  return (
    <div className="flex items-center justify-end gap-3.5 border-b border-app-border-soft px-6 py-4">
      <div className="rounded-lg border border-app-border-soft bg-app-panel px-3.5 py-1.5 text-center text-[11px] text-text-faint">
        System Status
        <div className="text-[13px] font-semibold text-status-green">Healthy</div>
      </div>
      {/* <Button onClick={openAddModal} className="flex items-center gap-1.5">
        <Plus size={15} /> Add Server
      </Button> */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-app-border-soft bg-app-panel text-xs font-bold text-text-dim">
        VG
      </div>
    </div>
  )
}
