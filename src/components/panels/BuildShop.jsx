import { useState } from 'react'
import { Lock } from 'lucide-react'
import { BUILDINGS, BUILDING_CATEGORIES, GRID, costFor } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canBuy, canExpand, nextExpansion } from '../../game/state/rules.js'
import { countOf } from '../../game/engine/grid.js'
import { Button, CoinTag, Sheet } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'

const TABS = [...BUILDING_CATEGORIES, { id: 'land', name: 'Land' }]

function LandTab({ onExpand }) {
  const { state } = useGame()
  const exp = nextExpansion(state)
  const check = canExpand(state)
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center">
      <Sprite id="ui.land" className="h-20 w-20" />
      <p className="text-ink-soft">
        Your town covers <b className="text-ink">{state.grid.unlockedRows}</b> of {GRID.rows} rows.
      </p>
      {exp ? (
        <>
          <p className="font-semibold">Unlock {exp.rows} more rows</p>
          <Button onClick={onExpand} disabled={!check.ok} className="min-w-40">
            <CoinTag amount={exp.cost} className="text-white" />
          </Button>
          {!check.ok && <p className="text-sm text-berry-500">{check.reason}</p>}
        </>
      ) : (
        <p className="font-semibold text-meadow-600">All land unlocked!</p>
      )}
    </div>
  )
}

export default function BuildShop({ onClose, onBuy, onExpand, notify, initialTab = 'farming' }) {
  const { state } = useGame()
  const [tab, setTab] = useState(initialTab)
  const items = Object.values(BUILDINGS).filter((b) => b.category === tab && b.buyable !== false)

  return (
    <Sheet title="Build" icon={<Sprite id="building.house" />} onClose={onClose}>
      <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === t.id ? 'bg-peach-400 text-white' : 'bg-cream-dark text-ink-soft'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {tab === 'land' ? (
        <LandTab onExpand={onExpand} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((def) => {
            const owned = countOf(state, def.id)
            const max = def.maxCount(state.level)
            const check = canBuy(state, def.id)
            const locked = state.level < def.unlockLevel
            return (
              <button
                key={def.id}
                onClick={() => (check.ok ? onBuy(def.id) : notify(check.reason))}
                className={`relative flex flex-col items-center rounded-3xl bg-white p-3 text-center shadow-sm transition active:scale-[0.97] ${check.ok ? '' : 'opacity-60'}`}
              >
                <div className="mb-1 grid aspect-square w-full place-items-center p-1">
                  <Sprite id={`building.${def.id}`} className={`max-h-full max-w-full ${locked ? 'grayscale' : ''}`} />
                </div>
                <div className="font-semibold leading-tight">{def.name}</div>
                <div className="text-xs text-ink-soft">{def.description}</div>
                <div className="mt-2 flex w-full items-center justify-between text-sm">
                  <CoinTag amount={costFor(def.id, owned)} />
                  <span className="text-xs font-medium text-ink-soft tabular-nums">{owned}/{max}</span>
                </div>
                {locked && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-0.5 text-xs font-semibold text-white">
                    <Lock size={12} /> Lv {def.unlockLevel}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </Sheet>
  )
}
