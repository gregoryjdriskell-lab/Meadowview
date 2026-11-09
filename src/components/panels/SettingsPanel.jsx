import { useState } from 'react'
import { Minus, Plus, Settings } from 'lucide-react'
import { useGame } from '../../game/state/GameProvider.jsx'
import { Button, Sheet } from '../ui/primitives.jsx'

export default function SettingsPanel({ onClose, tile, setTile }) {
  const { state, actions } = useGame()
  const [confirming, setConfirming] = useState(false)

  return (
    <Sheet title="Settings" icon={<Settings className="h-full w-full p-1 text-ink-soft" />} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-3xl bg-white p-4">
          <span className="font-semibold">Map zoom</span>
          <div className="flex items-center gap-2">
            <Button variant="soft" size="iconSm" onClick={() => setTile(tile - 8)} aria-label="Zoom out"><Minus size={18} /></Button>
            <span className="w-12 text-center tabular-nums">{tile}px</span>
            <Button variant="soft" size="iconSm" onClick={() => setTile(tile + 8)} aria-label="Zoom in"><Plus size={18} /></Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Meadowvale</p>
          <p>No ads, no purchases. Progress is saved on this device.</p>
          <p className="mt-2 tabular-nums">
            Orders filled: {state.stats.ordersCompleted} · Harvests: {state.stats.harvests}
          </p>
        </div>

        {confirming ? (
          <div className="flex gap-2">
            <Button variant="soft" className="flex-1" onClick={() => setConfirming(false)}>Keep playing</Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                actions.reset()
                onClose()
              }}
            >
              Yes, start over
            </Button>
          </div>
        ) : (
          <Button variant="soft" className="w-full text-berry-500" onClick={() => setConfirming(true)}>Reset progress…</Button>
        )}
      </div>
    </Sheet>
  )
}
