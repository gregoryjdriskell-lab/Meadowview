import { Lock, Move } from 'lucide-react'
import { CROPS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canPlant, fieldStatus } from '../../game/state/rules.js'
import { formatDuration, progress } from '../../game/engine/time.js'
import { Button, CoinTag, ProgressBar, Sheet } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'

export default function FieldPanel({ fieldId, onClose, onChooseSeed, onMove, notify }) {
  const { state, now } = useGame()
  const field = state.buildings[fieldId]
  if (!field) return null
  const status = fieldStatus(field, now)

  if (status !== 'empty') {
    const crop = CROPS[field.crop]
    return (
      <Sheet title={`${crop.name} field`} icon={<Sprite id={`item.${crop.id}`} />} onClose={onClose}>
        <div className="flex items-center gap-4 rounded-3xl bg-white p-4">
          <div className="relative h-20 w-20 shrink-0">
            <Sprite id="building.field" className="absolute inset-0 h-full w-full" />
            <Sprite id={`crop.${crop.id}.${status === 'ripe' ? 2 : 1}`} className="absolute inset-0 h-full w-full" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{status === 'ripe' ? 'Ready to harvest!' : `Ready in ${formatDuration(field.readyAt - now)}`}</p>
            <ProgressBar value={progress(field.plantedAt, field.readyAt, now)} className="mt-2" />
            <p className="mt-2 text-sm text-ink-soft">Yields {crop.yield} {crop.name.toLowerCase()} · +{crop.xp} XP</p>
          </div>
        </div>
        <Button variant="soft" className="mt-3 w-full" onClick={onMove}>
          <Move size={18} /> Move field
        </Button>
      </Sheet>
    )
  }

  return (
    <Sheet title="Plant a crop" icon={<Sprite id="building.field" />} onClose={onClose}>
      <p className="mb-3 text-sm text-ink-soft">Pick a seed, then tap or swipe across empty fields to keep planting.</p>
      <div className="grid grid-cols-3 gap-2.5">
        {Object.values(CROPS).map((crop) => {
          const locked = state.level < crop.unlockLevel
          const check = canPlant(state, fieldId, crop.id)
          return (
            <button
              key={crop.id}
              onClick={() => (check.ok ? onChooseSeed(crop.id) : notify(check.reason))}
              className={`relative flex flex-col items-center rounded-3xl bg-white p-2.5 shadow-sm active:scale-95 ${check.ok ? '' : 'opacity-55'}`}
            >
              <Sprite id={`item.${crop.id}`} className={`h-14 w-14 ${locked ? 'grayscale' : ''}`} />
              <span className="mt-1 text-sm font-semibold">{crop.name}</span>
              <span className="text-xs text-ink-soft">{formatDuration(crop.growSeconds * 1000)} · ×{crop.yield}</span>
              <span className="mt-1 text-xs">{crop.seedCost ? <CoinTag amount={crop.seedCost} size="h-3.5 w-3.5" /> : <b className="text-meadow-600">Free</b>}</span>
              {locked && (
                <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-ink/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Lock size={10} /> Lv {crop.unlockLevel}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <Button variant="soft" className="mt-3 w-full" onClick={onMove}>
        <Move size={18} /> Move field
      </Button>
    </Sheet>
  )
}
