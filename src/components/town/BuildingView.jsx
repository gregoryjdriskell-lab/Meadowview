/** One building on the grid: sprite + status overlays (crop stage, ready bubbles, progress). */
import { memo } from 'react'
import { BUILDINGS, isFactory, isHousing, isPen } from '../../game/config/index.js'
import { animalOf, animalStatus, fieldStatus, finishedJobs, penSummary, rentDue } from '../../game/state/rules.js'
import { progress } from '../../game/engine/time.js'
import Sprite from '../ui/Sprite.jsx'

function Bubble({ id }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-3/4">
      <div className="animate-bob">
        <div className="grid h-[calc(var(--tile)*0.8)] w-[calc(var(--tile)*0.8)] place-items-center rounded-full bg-white p-1 shadow-md ring-2 ring-butter-300">
          <Sprite id={id} />
        </div>
      </div>
    </div>
  )
}

function MiniProgress({ value }) {
  return (
    <div className="pointer-events-none absolute inset-x-[15%] bottom-[6%] h-1.5 overflow-hidden rounded-full bg-white/70">
      <div className="h-full rounded-full bg-meadow-500" style={{ width: `${value * 100}%` }} />
    </div>
  )
}

// Where animals stand inside a 2x2 pen, as fractions of the pen box (center points).
const YARD_SLOTS = [[0.62, 0.47], [0.3, 0.56], [0.8, 0.62], [0.5, 0.68], [0.22, 0.74]]
const POND_SLOTS = [[0.46, 0.58], [0.72, 0.57], [0.58, 0.7], [0.3, 0.72], [0.84, 0.72]]

function PenOverlay({ b, now, feedStock }) {
  const def = animalOf(b)
  const slots = b.type === 'duckpond' ? POND_SLOTS : YARD_SLOTS
  const sum = penSummary(b, now)
  const producing = b.animals.filter((a) => animalStatus(a, def, now) === 'producing')
  const nextDone = producing.reduce((best, a) => (!best || a.fedAt < best.fedAt ? a : best), null)
  return (
    <>
      {b.animals.map((a, i) => {
        const st = animalStatus(a, def, now)
        const [cx, cy] = slots[i % slots.length]
        return (
          <div
            key={i}
            className="pointer-events-none absolute h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cx * 100}%`, top: `${cy * 100}%`, zIndex: Math.round(cy * 10) }}
          >
            <div
              className={`h-full w-full ${st === 'producing' ? 'animate-bob' : ''}`}
              style={{ animationDelay: `${i * 0.37}s`, filter: st === 'hungry' ? 'saturate(0.55) brightness(0.97)' : undefined }}
            >
              <Sprite id={`animal.${def.id}`} />
            </div>
            {st === 'ready' && (
              <div className="absolute -right-[10%] -top-[20%] h-[55%] w-[55%] animate-pop">
                <Sprite id={`item.${def.product.id}`} />
              </div>
            )}
          </div>
        )
      })}
      {sum.ready > 0 ? (
        <Bubble id={`item.${def.product.id}`} />
      ) : sum.hungry > 0 && feedStock > 0 ? (
        <Bubble id={`item.${def.feed}`} />
      ) : nextDone ? (
        <MiniProgress value={progress(nextDone.fedAt, nextDone.fedAt + def.seconds * 1000, now)} />
      ) : null}
    </>
  )
}

function Overlay({ b, now, readyOrders, inventory }) {
  if (isPen(b.type)) return <PenOverlay b={b} now={now} feedStock={inventory[animalOf(b).feed] ?? 0} />
  if (b.type === 'field') {
    const status = fieldStatus(b, now)
    if (status === 'empty') return null
    const p = progress(b.plantedAt, b.readyAt, now)
    const stage = status === 'ripe' ? 2 : p < 0.5 ? 0 : 1
    return (
      <>
        <div className={`absolute inset-0 ${status === 'ripe' ? 'animate-bob' : ''}`}>
          <Sprite id={`crop.${b.crop}.${stage}`} />
        </div>
        {status === 'growing' && <MiniProgress value={p} />}
      </>
    )
  }
  if (isFactory(b.type)) {
    const done = finishedJobs(b, now)
    if (done.length) return <Bubble id={`item.${done[0].recipe}`} />
    const active = b.jobs.find((j) => j.startAt <= now && j.readyAt > now)
    return active ? <MiniProgress value={progress(active.startAt, active.readyAt, now)} /> : null
  }
  if (isHousing(b.type)) return rentDue(b, now).coins > 0 ? <Bubble id="ui.coin" /> : null
  if (b.type === 'board' && readyOrders > 0) return <Bubble id="avatar.0" />
  return null
}

function BuildingView({ b, now, tile, dimmed, readyOrders, inventory }) {
  const [w, h] = BUILDINGS[b.type].size
  return (
    <div
      className={`pointer-events-none absolute transition-opacity ${dimmed ? 'opacity-30' : ''}`}
      style={{ left: b.x * tile, top: b.y * tile, width: w * tile, height: h * tile, zIndex: (b.y + h) * 10 }}
    >
      <Sprite id={`building.${b.type}`} />
      <Overlay b={b} now={now} readyOrders={readyOrders} inventory={inventory} />
    </div>
  )
}

export default memo(BuildingView)
