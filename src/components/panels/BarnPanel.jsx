import { ITEMS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { CoinTag, Sheet } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'

function Section({ title, items }) {
  if (!items.length) return null
  return (
    <section className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-ink-soft">{title}</h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {items.map(([id, qty]) => (
          <div key={id} className="relative flex flex-col items-center rounded-2xl bg-white p-2 shadow-sm">
            <Sprite id={`item.${id}`} className="h-11 w-11" />
            <span className="mt-0.5 w-full truncate text-center text-xs text-ink-soft">{ITEMS[id]?.name ?? id}</span>
            <span className="absolute right-1.5 top-1 rounded-full bg-butter-300 px-1.5 text-xs font-bold tabular-nums">{qty}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function BarnPanel({ onClose }) {
  const { state } = useGame()
  const entries = Object.entries(state.inventory).filter(([, q]) => q > 0)
  const crops = entries.filter(([id]) => ITEMS[id]?.category === 'crop')
  const animal = entries.filter(([id]) => ITEMS[id]?.category === 'animal')
  const feed = entries.filter(([id]) => ITEMS[id]?.category === 'feed')
  const goods = entries.filter(([id]) => ITEMS[id]?.category === 'product')
  const worth = entries.reduce((s, [id, q]) => s + (ITEMS[id]?.value ?? 0) * q, 0)

  return (
    <Sheet title="Barn" icon={<Sprite id="item.wheat" />} onClose={onClose}>
      {entries.length === 0 ? (
        <p className="py-8 text-center text-ink-soft">Your barn is empty. Harvest some fields!</p>
      ) : (
        <>
          <Section title="Crops" items={crops} />
          <Section title="Animal goods" items={animal} />
          <Section title="Animal feed" items={feed} />
          <Section title="Goods" items={goods} />
          <p className="text-center text-xs text-ink-soft">
            Stock value ≈ <CoinTag amount={worth} size="h-3.5 w-3.5" />
          </p>
        </>
      )}
    </Sheet>
  )
}
