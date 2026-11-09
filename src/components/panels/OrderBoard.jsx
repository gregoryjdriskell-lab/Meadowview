import { Trash2, Truck } from 'lucide-react'
import { TOWNSFOLK } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canFulfill } from '../../game/state/rules.js'
import { formatDuration } from '../../game/engine/time.js'
import { Button, CoinTag, ItemNeed, Sheet, XpTag } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'

function OrderCard({ order, onDeliver }) {
  const { state, now, actions } = useGame()
  const person = TOWNSFOLK[order.requester]

  if (order.availableAt > now) {
    return (
      <div className="flex min-h-36 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-cream-dark p-4 text-ink-soft">
        <Truck size={28} />
        <span className="text-sm font-medium">New request in {formatDuration(order.availableAt - now)}</span>
      </div>
    )
  }

  const ready = canFulfill(state, order.id, now).ok
  return (
    <div className={`flex flex-col gap-2 rounded-3xl bg-white p-3 shadow-sm ring-2 ${ready ? 'ring-meadow-400' : 'ring-transparent'}`}>
      <div className="flex items-center gap-2">
        <Sprite id={`avatar.${person.avatar}`} className="h-10 w-10" />
        <div className="flex-1 leading-tight">
          <div className="font-semibold">{person.name}</div>
          <div className="text-xs text-ink-soft">would love…</div>
        </div>
        <button aria-label="Skip order" onClick={() => actions.discard(order.id)} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft/70 active:bg-cream-dark">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {order.items.map(({ id, qty }) => (
          <ItemNeed key={id} id={id} need={qty} have={state.inventory[id] ?? 0} />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-3 pt-1">
        <CoinTag amount={order.coins} />
        <XpTag amount={order.xp} />
        <Button size="sm" className="ml-auto" disabled={!ready} onClick={() => onDeliver(order)}>
          Deliver
        </Button>
      </div>
    </div>
  )
}

export default function OrderBoard({ onClose, onDeliver }) {
  const { state } = useGame()
  return (
    <Sheet title="Order Board" icon={<Sprite id="building.board" />} onClose={onClose}>
      <p className="mb-3 text-sm text-ink-soft">Neighbours pay coins and XP for what they need. Skip an order to get a new one later.</p>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        {state.orders.map((o) => (
          <OrderCard key={o.id} order={o} onDeliver={onDeliver} />
        ))}
      </div>
    </Sheet>
  )
}
