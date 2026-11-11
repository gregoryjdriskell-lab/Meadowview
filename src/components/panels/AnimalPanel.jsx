import { Check, Move, Plus } from 'lucide-react'
import { BUILDINGS, ITEMS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { animalOf, animalStatus, canBuyAnimal, canCollectAnimals, canFeed, penSummary } from '../../game/state/rules.js'
import { formatDuration, progress } from '../../game/engine/time.js'
import { Button, CoinTag, Sheet } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'
import BuildingIcon from '../ui/BuildingIcon.jsx'

function AnimalCard({ animal, def, now }) {
  const st = animalStatus(animal, def, now)
  const readyAt = animal.fedAt + def.seconds * 1000
  return (
    <div className={`relative flex flex-col items-center rounded-2xl p-1.5 ${st === 'ready' ? 'bg-meadow-200' : 'bg-white'}`}>
      <Sprite id={`animal.${def.id}`} className={`h-12 w-12 ${st === 'hungry' ? 'saturate-50' : ''}`} />
      {st === 'ready' && (
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-meadow-500 text-white">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <span className="mt-0.5 text-[11px] font-semibold tabular-nums text-ink-soft">
        {st === 'hungry' ? 'Hungry' : st === 'ready' ? 'Ready' : formatDuration(readyAt - now)}
      </span>
      {st === 'producing' && (
        <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-cream-dark">
          <div className="h-full bg-meadow-500" style={{ width: `${progress(animal.fedAt, readyAt, now) * 100}%` }} />
        </div>
      )}
    </div>
  )
}

export default function AnimalPanel({ buildingId, onClose, onFeed, onCollect, onMove, notify }) {
  const { state, now, actions } = useGame()
  const b = state.buildings[buildingId]
  if (!b) return null
  const pen = BUILDINGS[b.type]
  const def = animalOf(b)
  const sum = penSummary(b, now)
  const feedHave = state.inventory[def.feed] ?? 0
  const feedCheck = canFeed(state, buildingId, now)
  const buy = canBuyAnimal(state, buildingId)

  return (
    <Sheet title={pen.name} icon={<BuildingIcon type={b.type} />} onClose={onClose}>
      <div className="mb-3 flex items-center gap-2 rounded-3xl bg-peach-100 px-3 py-2 text-sm">
        <Sprite id={`item.${def.feed}`} className="h-7 w-7 shrink-0" />
        <span className="flex-1 text-ink-soft">
          Each {def.name.toLowerCase()} eats 1 {ITEMS[def.feed].name.toLowerCase()} and gives 1 {def.product.name.toLowerCase()} after{' '}
          {formatDuration(def.seconds * 1000)}.
        </span>
        <Sprite id={`item.${def.product.id}`} className="h-7 w-7 shrink-0" />
      </div>

      <div className="mb-3 grid grid-cols-5 gap-2">
        {b.animals.map((a, i) => (
          <AnimalCard key={i} animal={a} def={def} now={now} />
        ))}
        {Array.from({ length: pen.maxAnimals - b.animals.length }, (_, i) => (
          <div key={`e${i}`} className="grid min-h-[5.5rem] place-items-center rounded-2xl border-2 border-dashed border-cream-dark text-ink-soft/50">
            <Plus size={18} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="warm" disabled={!sum.hungry} onClick={() => (feedCheck.ok ? onFeed() : notify(feedCheck.reason))} className={feedCheck.ok ? '' : 'opacity-60'}>
          <Sprite id={`item.${def.feed}`} className="h-5 w-5" /> Feed ({feedHave})
        </Button>
        <Button disabled={!canCollectAnimals(state, buildingId, now).ok} onClick={onCollect}>
          <Sprite id={`item.${def.product.id}`} className="h-5 w-5" /> Collect {sum.ready > 0 && `(${sum.ready})`}
        </Button>
      </div>
      {feedHave === 0 && sum.hungry > 0 && <p className="mt-2 text-center text-xs text-berry-500">Out of feed. Make {ITEMS[def.feed].name} at the Feed Mill.</p>}

      <Button
        variant="soft"
        className="mt-3 w-full"
        disabled={b.animals.length >= pen.maxAnimals}
        onClick={() => (buy.ok ? actions.buyAnimal(buildingId) : notify(buy.reason))}
      >
        {b.animals.length >= pen.maxAnimals ? (
          'Pen is full'
        ) : (
          <>
            <Plus size={18} /> Add a {def.name.toLowerCase()} · {buy.cost != null ? <CoinTag amount={buy.cost} /> : buy.reason}
          </>
        )}
      </Button>
      <Button variant="soft" className="mt-2 w-full" onClick={onMove}>
        <Move size={18} /> Move pen
      </Button>
    </Sheet>
  )
}
