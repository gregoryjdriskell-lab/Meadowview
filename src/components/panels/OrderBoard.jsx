import { useState } from 'react'
import { Check, ClipboardPaste, Handshake, HeartHandshake, Lock, Trash2, Truck } from 'lucide-react'
import { BOOSTERS, CLIENTS, MAX_REP, REP_PERK_TEXT, TOWNSFOLK } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canFulfill, missingUnits } from '../../game/state/rules.js'
import { orderReward, repInfo, skipPenalty } from '../../game/state/reputation.js'
import { activeClients, clientPool } from '../../game/engine/orders.js'
import { openRequestFor } from '../../game/state/help.js'
import { formatDuration } from '../../game/engine/time.js'
import { Button, CoinTag, ItemNeed, ProgressBar, Sheet, XpTag } from '../ui/primitives.jsx'
import ClientEmblem, { RepBadge } from '../ui/ClientEmblem.jsx'
import Sprite from '../ui/Sprite.jsx'

function OrderCard({ order, onDeliver, onAskHelp }) {
  const { state, now, actions } = useGame()
  const [confirmSkip, setConfirmSkip] = useState(false)
  const client = CLIENTS[order.client]
  const person = TOWNSFOLK[client.contact]

  if (order.availableAt > now) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-cream-dark p-4 text-ink-soft">
        <Truck size={28} />
        <span className="text-sm font-medium">New request in {formatDuration(order.availableAt - now)}</span>
      </div>
    )
  }

  const rep = repInfo(state, order.client)
  const reward = orderReward(state, order)
  const ready = canFulfill(state, order.id, now).ok
  const missing = missingUnits(state, order)
  const withVouchers = !ready && canFulfill(state, order.id, now, true)
  const penalty = skipPenalty(state, order)

  return (
    <div className={`flex flex-col gap-2 rounded-3xl bg-white p-3 shadow-sm ring-2 ${ready ? 'ring-meadow-400' : 'ring-transparent'}`}>
      <div className="flex items-center gap-2">
        <ClientEmblem client={client} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate font-semibold">{client.name}</div>
          <div className="flex items-center gap-1 text-xs text-ink-soft">
            <Sprite id={`avatar.${client.contact}`} className="h-4 w-4" />
            {person.name}
            <RepBadge level={rep.level} className="ml-0.5" />
          </div>
        </div>
        <button aria-label="Skip order" onClick={() => setConfirmSkip(true)} className="grid h-8 w-8 place-items-center rounded-full text-ink-soft/70 active:bg-cream-dark">
          <Trash2 size={16} />
        </button>
      </div>

      {confirmSkip ? (
        <div className="flex flex-1 flex-col justify-between gap-2 rounded-2xl bg-berry-300/20 p-2 text-sm">
          <p>
            Skip this order?{' '}
            {penalty > 0 ? (
              <>
                You'll lose <b>{penalty} reputation</b> with {client.name}.
              </>
            ) : (
              <>No reputation lost (you're at the start of this level).</>
            )}{' '}
            A new request arrives in 30s.
          </p>
          <div className="flex gap-2">
            <Button variant="soft" size="sm" className="flex-1" onClick={() => setConfirmSkip(false)}>Keep</Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => {
                actions.discard(order.id)
                setConfirmSkip(false)
              }}
            >
              Skip
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1">
            {order.items.map(({ id, qty }) => (
              <ItemNeed key={id} id={id} need={qty} have={state.inventory[id] ?? 0} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1">
              <CoinTag amount={reward.coins} />
              {reward.coinBonus > 0 && <span className="text-[10px] font-bold text-meadow-600">+{Math.round(reward.coinBonus * 100)}%</span>}
            </span>
            <XpTag amount={reward.xp} />
            <span className="inline-flex items-center gap-1 font-semibold text-berry-500">
              <Handshake size={15} /> +{reward.rep}
            </span>
          </div>
          <div className="mt-auto flex gap-2 pt-1">
            {withVouchers?.ok ? (
              <Button variant="warm" size="sm" className="flex-1" onClick={() => onDeliver(order, true)}>
                <Sprite id="booster.voucher" className="h-5 w-5" /> Use {withVouchers.vouchers}
              </Button>
            ) : null}
            <Button size="sm" className="flex-1" disabled={!ready} onClick={() => onDeliver(order, false)}>
              {ready ? 'Deliver' : `Need ${missing} more`}
            </Button>
          </div>
          {!ready && (
            <button onClick={() => onAskHelp(order)} className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-berry-500 active:opacity-70">
              <HeartHandshake size={14} />
              {openRequestFor(state, order.id) ? 'Help asked · share again' : 'Ask a neighbour for help'}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function ClientRow({ client }) {
  const { state } = useGame()
  const ownedTypes = new Set(Object.values(state.buildings).map((b) => b.type))
  const person = TOWNSFOLK[client.contact]
  const locked = state.level < client.unlockLevel
  const waiting = !locked && clientPool(client, state.level, ownedTypes).length === 0
  const rep = repInfo(state, client.id)
  const booster = BOOSTERS[client.booster]

  return (
    <div className={`rounded-3xl bg-white p-3 shadow-sm ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <ClientEmblem client={client} className={`h-12 w-12 ${locked ? 'grayscale' : ''}`} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{client.name}</span>
            {!locked && <RepBadge level={rep.level} />}
          </div>
          <div className="text-xs text-ink-soft">{client.vibe}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
            <Sprite id={`avatar.${client.contact}`} className="h-4 w-4" /> {person.name} · {rep.orders} orders
          </div>
        </div>
      </div>

      {locked ? (
        <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft">
          <Lock size={14} /> Opens at level {client.unlockLevel}
        </p>
      ) : (
        <>
          {waiting && <p className="mt-2 text-xs text-berry-500">They'll start ordering once you can make something they want.</p>}
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar value={rep.progress} className="flex-1" color="bg-berry-400" />
            <span className="text-xs tabular-nums text-ink-soft">{rep.maxed ? 'Max' : `${rep.xp - rep.from}/${rep.to - rep.from}`}</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {[2, 3, 4, 5].map((lvl) => (
              <li key={lvl} className={`flex items-start gap-1.5 ${rep.level >= lvl ? 'text-ink' : 'text-ink-soft/70'}`}>
                {rep.level >= lvl ? <Check size={14} className="mt-px shrink-0 text-meadow-600" /> : <span className="w-3.5 shrink-0 text-center">{lvl}</span>}
                {REP_PERK_TEXT[lvl]}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-cream px-2 py-1 text-xs text-ink-soft">
            <Sprite id={`booster.${client.booster}`} className="h-6 w-6" />
            Loyalty gifts: <b className="text-ink">{booster.name}</b>
          </div>
        </>
      )}
    </div>
  )
}

export default function OrderBoard({ onClose, onDeliver, onAskHelp, onPasteLink }) {
  const { state } = useGame()
  const [tab, setTab] = useState('orders')
  const ownedTypes = new Set(Object.values(state.buildings).map((b) => b.type))
  const active = activeClients(state.level, ownedTypes).length
  const clients = Object.values(CLIENTS).sort((a, b) => a.unlockLevel - b.unlockLevel)

  return (
    <Sheet title="Order Board" icon={<Sprite id="building.board" />} onClose={onClose}>
      <div className="mb-3 flex gap-2">
        {[
          ['orders', 'Orders'],
          ['clients', `Clients (${active})`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === id ? 'bg-meadow-500 text-white' : 'bg-cream-dark text-ink-soft'}`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          {Object.keys(BOOSTERS).map((id) => (
            <span key={id} className="inline-flex items-center text-xs font-bold tabular-nums" title={BOOSTERS[id].name}>
              <Sprite id={`booster.${id}`} className="h-6 w-6" />
              {state.boosters?.[id] ?? 0}
            </span>
          ))}
        </div>
      </div>

      {tab === 'orders' ? (
        <>
          <p className="mb-2 text-sm text-ink-soft">Local businesses order what they need. Deliver to earn coins, XP and their trust. Skipping costs a little reputation.</p>
          <button onClick={onPasteLink} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pond-200 px-3 py-1 text-xs font-semibold text-pond-500 active:scale-95">
            <ClipboardPaste size={14} /> Got a link from a neighbour? Paste it here
          </button>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            {state.orders.map((o) => (
              <OrderCard key={o.id} order={o} onDeliver={onDeliver} onAskHelp={onAskHelp} />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-ink-soft">
            Build trust with each business (up to {MAX_REP}★) for bigger rewards and free boosters that help finish orders.
          </p>
          <div className="space-y-3">
            {clients.map((c) => (
              <ClientRow key={c.id} client={c} />
            ))}
          </div>
        </>
      )}
    </Sheet>
  )
}
