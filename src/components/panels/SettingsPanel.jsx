import { useState } from 'react'
import { HeartHandshake, Minus, Pencil, Plus, Settings, Share2 } from 'lucide-react'
import { CLIENTS } from '../../game/config/index.js'
import { giftShare, itemList, requestShare } from '../social/share.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { Button, Sheet } from '../ui/primitives.jsx'

export default function SettingsPanel({ onClose, tile, setTile, setDialog }) {
  const { state, actions } = useGame()
  const [confirming, setConfirming] = useState(false)

  return (
    <Sheet title="Settings" icon={<Settings className="h-full w-full p-1 text-ink-soft" />} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-3xl bg-white p-4">
          <span className="font-semibold">Map zoom</span>
          <div className="flex items-center gap-2">
            <Button variant="soft" size="iconSm" onClick={() => setTile(tile / 1.2)} aria-label="Zoom out"><Minus size={18} /></Button>
            <span className="w-12 text-center tabular-nums">{tile}px</span>
            <Button variant="soft" size="iconSm" onClick={() => setTile(tile * 1.2)} aria-label="Zoom in"><Plus size={18} /></Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 text-sm">
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} className="text-berry-500" />
            <span className="flex-1 font-semibold">Neighbours</span>
            <button
              onClick={() => setDialog({ type: 'name', onDone: () => setDialog(null) })}
              className="inline-flex items-center gap-1 rounded-full bg-cream-dark px-3 py-1 text-xs font-semibold text-ink-soft"
            >
              <Pencil size={12} /> {state.profile.name || 'Set your name'}
            </button>
          </div>
          <p className="mt-1 text-ink-soft tabular-nums">
            Helped others {state.stats.helpsGiven ?? 0}× · Got help {state.stats.helpsReceived ?? 0}×
          </p>
          {[
            ...state.helpRequests.filter((r) => r.status === 'open').map((r) => ({
              key: r.id,
              label: `Asked: ${itemList(r.items)} (${CLIENTS[r.client]?.name ?? 'order'})`,
              share: () => requestShare(state.profile, r),
            })),
            ...state.sentGifts.slice(-5).reverse().map((g) => ({
              key: g.id,
              label: `Sent${g.toName ? ` to ${g.toName}` : ''}: ${itemList(g.items)}`,
              share: () => giftShare(state.profile, g),
            })),
          ].map((row) => (
            <div key={row.key} className="mt-2 flex items-center gap-2 rounded-2xl bg-cream px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-xs">{row.label}</span>
              <button
                onClick={() => setDialog({ type: 'share', share: row.share() })}
                aria-label="Share again"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-meadow-600"
              >
                <Share2 size={15} />
              </button>
            </div>
          ))}
          <button onClick={() => setDialog({ type: 'paste' })} className="mt-2 text-xs font-semibold text-pond-500">
            Paste a link from a neighbour
          </button>
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
