/** Generic panel for homes, decor and the order board: description, rent, move. */
import { Move } from 'lucide-react'
import { BUILDINGS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { rentDue } from '../../game/state/rules.js'
import { formatDuration } from '../../game/engine/time.js'
import { Button, CoinTag, Sheet } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'

export default function InfoPanel({ buildingId, onClose, onMove, onCollectRent }) {
  const { state, now } = useGame()
  const b = state.buildings[buildingId]
  if (!b) return null
  const def = BUILDINGS[b.type]
  const rent = def.rent
  const due = rent ? rentDue(b, now) : null
  const periodMs = rent ? rent.everySeconds * 1000 : 0
  const nextIn = rent && !due.capped ? periodMs - ((now - b.rentFrom) % periodMs) : 0

  return (
    <Sheet title={def.name} icon={<Sprite id={`building.${b.type}`} />} onClose={onClose}>
      <div className="flex items-center gap-4 rounded-3xl bg-white p-4">
        <Sprite id={`building.${b.type}`} className="h-20 w-20 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="text-ink-soft">{def.description}</p>
          {rent && (
            <div className="mt-2 space-y-1">
              <p>
                Rent: <CoinTag amount={rent.coins} size="h-3.5 w-3.5" /> every {formatDuration(periodMs)} (holds up to {rent.maxPeriods})
              </p>
              <p className="text-ink-soft">{due.capped ? 'Rent box is full!' : `Next coins in ${formatDuration(nextIn)}`}</p>
            </div>
          )}
        </div>
      </div>
      {rent && (
        <Button className="mt-3 w-full" disabled={!due.coins} onClick={onCollectRent}>
          Collect <CoinTag amount={due.coins} className="text-white" />
        </Button>
      )}
      <Button variant="soft" className="mt-3 w-full" onClick={onMove}>
        <Move size={18} /> Move
      </Button>
    </Sheet>
  )
}
