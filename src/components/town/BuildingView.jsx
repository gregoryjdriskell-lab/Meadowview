/**
 * A building on the isometric map, in two parts:
 *  - WorldBuilding: the sprite plus things that live "in" the world (crops, animals).
 *    Rendered inside the scaled, depth-sorted world layer.
 *  - BuildingStatus: bubbles and progress bars. Rendered in an unscaled overlay so they
 *    stay readable at any zoom and are never hidden behind other buildings.
 */
import { memo } from 'react'
import { BUILDINGS, isFactory, isHousing, isPen } from '../../game/config/index.js'
import { animalOf, animalStatus, fieldStatus, finishedJobs, penSummary, rentDue } from '../../game/state/rules.js'
import { progress } from '../../game/engine/time.js'
import { ANIMAL_SIZE, penSlots } from '../../assets/penSlots.js'
import Sprite from '../ui/Sprite.jsx'

// ── In-world ─────────────────────────────────────────────

function PenAnimals({ b, now }) {
  const def = animalOf(b)
  const slots = penSlots(b.type)
  return b.animals.map((a, i) => {
    const st = animalStatus(a, def, now)
    const [cx, cy] = slots[i % slots.length]
    const size = ANIMAL_SIZE * 100
    return (
      <div
        key={i}
        className="pointer-events-none absolute"
        style={{ left: `${cx * 100 - size / 2}%`, top: `${cy * 100 - size * 0.9}%`, width: `${size}%`, height: `${size}%` }}
      >
        <div
          className={`h-full w-full ${st === 'producing' ? 'animate-bob' : ''}`}
          style={{ animationDelay: `${i * 0.37}s`, filter: st === 'hungry' ? 'saturate(0.55) brightness(0.97)' : undefined }}
        >
          <Sprite id={`animal.${def.id}`} />
        </div>
        {st === 'ready' && (
          <div className="absolute -right-[12%] -top-[22%] h-[55%] w-[55%] animate-pop">
            <Sprite id={`item.${def.product.id}`} />
          </div>
        )}
      </div>
    )
  })
}

function FieldCrop({ b, now }) {
  const status = fieldStatus(b, now)
  if (status === 'empty') return null
  const p = progress(b.plantedAt, b.readyAt, now)
  const stage = status === 'ripe' ? 2 : p < 0.5 ? 0 : 1
  return (
    <div className={`pointer-events-none absolute inset-0 ${status === 'ripe' ? 'animate-bob' : ''}`}>
      <Sprite id={`crop.${b.crop}.${stage}`} />
    </div>
  )
}

function WorldBuildingImpl({ b, now, box, scale, z, dimmed }) {
  return (
    <div
      data-bid={b.id}
      className={`iso-hit pointer-events-none absolute transition-opacity ${dimmed ? 'opacity-30' : ''}`}
      style={{ left: box.left * scale, top: box.top * scale, width: box.width * scale, height: box.height * scale, zIndex: z }}
    >
      <Sprite id={`building.${b.type}`} />
      {b.type === 'field' && <FieldCrop b={b} now={now} />}
      {isPen(b.type) && <PenAnimals b={b} now={now} />}
    </div>
  )
}

export const WorldBuilding = memo(WorldBuildingImpl)

// ── Status overlay ───────────────────────────────────────

function Bubble({ id, x, y, size }) {
  return (
    <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full" style={{ left: x, top: y }}>
      <div className="animate-bob">
        <div className="grid place-items-center rounded-full bg-white p-1 shadow-md ring-2 ring-butter-300" style={{ width: size, height: size }}>
          <Sprite id={id} />
        </div>
      </div>
    </div>
  )
}

function Bar({ value, x, y, width }) {
  return (
    <div className="pointer-events-none absolute h-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-white/80 shadow-sm" style={{ left: x, top: y, width }}>
      <div className="h-full rounded-full bg-meadow-500" style={{ width: `${value * 100}%` }} />
    </div>
  )
}

/** What a building wants to show right now: { bubble: spriteId } | { bar: 0..1 } | null */
function statusOf(b, now, readyOrders, inventory) {
  if (b.type === 'field') {
    const st = fieldStatus(b, now)
    return st === 'growing' ? { bar: progress(b.plantedAt, b.readyAt, now) } : null
  }
  if (isFactory(b.type)) {
    const done = finishedJobs(b, now)
    if (done.length) return { bubble: `item.${done[0].recipe}` }
    const active = b.jobs.find((j) => j.startAt <= now && j.readyAt > now)
    return active ? { bar: progress(active.startAt, active.readyAt, now) } : null
  }
  if (isPen(b.type)) {
    const def = animalOf(b)
    const sum = penSummary(b, now)
    if (sum.ready) return { bubble: `item.${def.product.id}` }
    if (sum.hungry && (inventory[def.feed] ?? 0) > 0) return { bubble: `item.${def.feed}` }
    const producing = b.animals.filter((a) => animalStatus(a, def, now) === 'producing')
    if (!producing.length) return null
    const first = producing.reduce((m, a) => (a.fedAt < m.fedAt ? a : m))
    return { bar: progress(first.fedAt, first.fedAt + def.seconds * 1000, now) }
  }
  if (isHousing(b.type)) return rentDue(b, now).coins > 0 ? { bubble: 'ui.coin' } : null
  if (b.type === 'board' && readyOrders > 0) return { bubble: 'avatar.0' }
  return null
}

/** Roughly how tall each kind of art rises above its footprint's back corner (art units). */
const ART_HEIGHT = { field: 40, flowers: 40, tree: 170, board: 120, pen: 100, default: 175 }

export function BuildingStatus({ b, now, box, scale, readyOrders, inventory, tile }) {
  const s = statusOf(b, now, readyOrders, inventory)
  if (!s) return null
  const cx = (box.left + box.width / 2) * scale
  if (s.bubble) {
    const [w, h] = BUILDINGS[b.type].size
    const diamondTop = box.top + box.height - (w + h) * 50
    const rise = ART_HEIGHT[isPen(b.type) ? 'pen' : b.type] ?? ART_HEIGHT.default
    return <Bubble id={s.bubble} x={cx} y={(diamondTop - rise + 20) * scale} size={Math.max(34, tile * 0.5)} />
  }
  const bottom = (box.top + box.height) * scale
  return <Bar value={s.bar} x={cx} y={bottom - box.height * scale * 0.12} width={Math.max(28, box.width * scale * 0.35)} />
}
