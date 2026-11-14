import { BOOSTERS, CLIENTS, REP_PERK_TEXT, TOWNSFOLK } from '../../game/config/index.js'
import { Button } from '../ui/primitives.jsx'
import ClientEmblem, { RepBadge } from '../ui/ClientEmblem.jsx'
import Sprite from '../ui/Sprite.jsx'

export default function RepUpModal({ event, onClose }) {
  const client = CLIENTS[event.client]
  const person = TOWNSFOLK[client.contact]
  const gifts = Object.entries(event.gift ?? {}).filter(([, n]) => n > 0)
  return (
    <div className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-ink/30 p-6">
      <div className="w-full max-w-sm animate-pop rounded-[2rem] bg-cream p-6 text-center shadow-2xl">
        <ClientEmblem client={client} className="mx-auto -mt-14 h-20 w-20" />
        <h2 className="mt-3 text-xl font-bold">{client.name} trusts you more!</h2>
        <div className="mt-1 flex items-center justify-center gap-2 text-ink-soft">
          <Sprite id={`avatar.${client.contact}`} className="h-6 w-6" />
          {person.name} · <RepBadge level={event.level} />
        </div>
        <div className="mt-4 rounded-2xl bg-white p-3 text-sm">
          <div className="text-xs font-semibold text-ink-soft">New perk</div>
          <div className="font-semibold">{REP_PERK_TEXT[event.level]}</div>
        </div>
        {gifts.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            {gifts.map(([id, n]) => (
              <div key={id} className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 text-sm font-semibold">
                <Sprite id={`booster.${id}`} className="h-8 w-8" /> {n}× {BOOSTERS[id].name}
              </div>
            ))}
          </div>
        )}
        <Button size="lg" className="mt-5 w-full" onClick={onClose}>
          Thanks!
        </Button>
      </div>
    </div>
  )
}
