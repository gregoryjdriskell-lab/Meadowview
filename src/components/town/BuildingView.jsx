/** One building on the grid: sprite + status overlays (crop stage, ready bubbles, progress). */
import { memo } from 'react'
import { BUILDINGS, isFactory, isHousing } from '../../game/config/index.js'
import { fieldStatus, finishedJobs, rentDue } from '../../game/state/rules.js'
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

function Overlay({ b, now, readyOrders }) {
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

function BuildingView({ b, now, tile, dimmed, readyOrders }) {
  const [w, h] = BUILDINGS[b.type].size
  return (
    <div
      className={`pointer-events-none absolute transition-opacity ${dimmed ? 'opacity-30' : ''}`}
      style={{ left: b.x * tile, top: b.y * tile, width: w * tile, height: h * tile, zIndex: (b.y + h) * 10 }}
    >
      <Sprite id={`building.${b.type}`} />
      <Overlay b={b} now={now} readyOrders={readyOrders} />
    </div>
  )
}

export default memo(BuildingView)
