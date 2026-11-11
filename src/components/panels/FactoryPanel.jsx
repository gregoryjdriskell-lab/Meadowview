import { Check, Clock, Lock, Move } from 'lucide-react'
import { BUILDINGS, RECIPES } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canQueue, finishedJobs } from '../../game/state/rules.js'
import { formatDuration, progress } from '../../game/engine/time.js'
import { Button, ItemNeed, Sheet, XpTag } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'

function QueueSlot({ job, now }) {
  if (!job) return <div className="aspect-square rounded-2xl border-2 border-dashed border-cream-dark" />
  const done = job.readyAt <= now
  const active = !done && job.startAt <= now
  return (
    <div className={`relative aspect-square rounded-2xl p-1.5 ${done ? 'bg-meadow-200' : 'bg-white'}`}>
      <Sprite id={`item.${job.recipe}`} className={`h-full w-full ${!done && !active ? 'opacity-50' : ''}`} />
      {done && (
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-meadow-500 text-white">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      {active && (
        <span className="absolute inset-x-0 -bottom-2 mx-auto w-fit rounded-full bg-ink/80 px-1.5 text-[10px] font-semibold text-white tabular-nums">
          {formatDuration(job.readyAt - now)}
        </span>
      )}
      {active && (
        <div className="absolute inset-x-1.5 bottom-1 h-1 overflow-hidden rounded-full bg-cream-dark">
          <div className="h-full bg-meadow-500" style={{ width: `${progress(job.startAt, job.readyAt, now) * 100}%` }} />
        </div>
      )}
    </div>
  )
}

export default function FactoryPanel({ buildingId, onClose, onCollect, onMove, notify }) {
  const { state, now, actions } = useGame()
  const b = state.buildings[buildingId]
  if (!b) return null
  const def = BUILDINGS[b.type]
  const recipes = Object.values(RECIPES).filter((r) => r.building === b.type)
  const done = finishedJobs(b, now)

  return (
    <Sheet title={def.name} icon={<Sprite id={`building.${b.type}`} />} onClose={onClose}>
      <div className="mb-4 rounded-3xl bg-peach-100 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-soft">Production queue</span>
          <Button variant="primary" size="sm" disabled={!done.length} onClick={onCollect}>
            Collect {done.length > 0 && `(${done.length})`}
          </Button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: def.queueSlots }, (_, i) => (
            <QueueSlot key={i} job={b.jobs[i]} now={now} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {recipes.map((r) => {
          const locked = state.level < r.unlockLevel
          const check = canQueue(state, buildingId, r.id)
          return (
            <div key={r.id} className={`flex items-center gap-3 rounded-3xl bg-white p-3 shadow-sm ${locked ? 'opacity-55' : ''}`}>
              <Sprite id={`item.${r.id}`} className={`h-14 w-14 shrink-0 ${locked ? 'grayscale' : ''}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-semibold leading-tight">{r.name}{r.yield > 1 && <span className="text-meadow-600"> ×{r.yield}</span>}</span>
                  <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-xs text-ink-soft">
                    <Clock size={12} /> {formatDuration(r.seconds * 1000)}
                  </span>
                  <XpTag amount={r.xp} className="text-xs text-ink-soft" size="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(r.inputs).map(([id, qty]) => (
                    <ItemNeed key={id} id={id} need={qty} have={state.inventory[id] ?? 0} />
                  ))}
                </div>
              </div>
              {locked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-ink/75 px-2 py-1 text-xs font-semibold text-white">
                  <Lock size={12} /> Lv {r.unlockLevel}
                </span>
              ) : (
                <Button
                  variant="warm"
                  className={`${check.ok ? '' : 'opacity-45 shadow-none'}`}
                  onClick={() => (check.ok ? actions.queue(buildingId, r.id) : notify(check.reason))}
                >
                  Make
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <Button variant="soft" className="mt-3 w-full" onClick={onMove}>
        <Move size={18} /> Move building
      </Button>
    </Sheet>
  )
}
