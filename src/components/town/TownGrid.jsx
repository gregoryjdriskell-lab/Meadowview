/**
 * The town map: a scrollable DOM grid (cheap, crisp on retina, accessible to touch).
 *
 * Input model
 *  - Normal mode: native scrolling pans the map, a tap (click) selects a tile.
 *  - Seed mode:   panning is disabled and pointer drags "paint" across tiles so you
 *                 can plant/harvest a whole row of fields in one swipe.
 */
import { useRef } from 'react'
import { BUILDINGS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canMove, canPlace, nextExpansion } from '../../game/state/rules.js'
import { CoinTag } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'
import BuildingView from './BuildingView.jsx'

function Ghost({ placement, tile, valid }) {
  const [w, h] = BUILDINGS[placement.type].size
  return (
    <div className="pointer-events-none absolute" style={{ left: placement.x * tile, top: placement.y * tile, width: w * tile, height: h * tile, zIndex: 999 }}>
      <div className={`absolute inset-0 rounded-xl border-[3px] border-dashed ${valid ? 'border-meadow-600 bg-meadow-400/40' : 'border-berry-500 bg-berry-400/40'}`} />
      <div className="absolute inset-0 animate-bob opacity-90">
        <Sprite id={`building.${placement.type}`} />
      </div>
    </div>
  )
}

function FloatingFx({ fx, tile }) {
  return fx.map((f) => (
    <div
      key={f.key}
      className="pointer-events-none absolute flex animate-float-up items-center gap-0.5 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-sm font-bold text-ink shadow-md"
      style={{ left: f.x * tile, top: f.y * tile - tile * 0.4, zIndex: 1000 }}
    >
      {f.sprite && <Sprite id={f.sprite} className="h-5 w-5" />}
      {f.text}
    </div>
  ))
}

export default function TownGrid({ tile, placement, seedMode, onTap, onPaint, onExpand, fx, readyOrders }) {
  const { state, now } = useGame()
  const gridRef = useRef(null)
  const stroke = useRef(null)
  const { cols, rows, unlockedRows } = state.grid

  const tileFromEvent = (e) => {
    const r = gridRef.current.getBoundingClientRect()
    const x = Math.floor((e.clientX - r.left) / tile)
    const y = Math.floor((e.clientY - r.top) / tile)
    return x >= 0 && y >= 0 && x < cols && y < unlockedRows ? { x, y } : null
  }

  const handleClick = (e) => {
    if (seedMode) return
    const t = tileFromEvent(e)
    if (t) onTap(t.x, t.y)
  }

  const paint = (e) => {
    const t = tileFromEvent(e)
    if (!t) return
    const key = `${t.x},${t.y}`
    if (stroke.current.has(key)) return
    stroke.current.add(key)
    onPaint(t.x, t.y)
  }

  const pointerHandlers = seedMode
    ? {
        onPointerDown: (e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          stroke.current = new Set()
          paint(e)
        },
        onPointerMove: (e) => stroke.current && paint(e),
        onPointerUp: () => (stroke.current = null),
        onPointerCancel: () => (stroke.current = null),
      }
    : {}

  const valid = placement
    ? placement.mode === 'move'
      ? canMove(state, placement.id, placement.x, placement.y).ok
      : canPlace(state, placement.type, placement.x, placement.y).ok
    : false

  const expansion = nextExpansion(state)
  const buildings = Object.values(state.buildings)

  return (
    <div className="no-scrollbar absolute inset-0 isolate overflow-auto" style={{ touchAction: seedMode ? 'none' : 'pan-x pan-y' }}>
      <div className="flex min-h-full w-max min-w-full items-start justify-center" style={{ padding: `${tile * 1.6}px ${tile * 0.5}px ${tile * 1.2}px` }}>
        <div
          ref={gridRef}
          onClick={handleClick}
          {...pointerHandlers}
          className="grass relative rounded-3xl shadow-[0_0_0_6px_#95d06f,0_10px_30px_rgba(60,90,40,0.25)]"
          style={{ width: cols * tile, height: rows * tile, '--tile': `${tile}px` }}
        >
          {placement && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                height: unlockedRows * tile,
                backgroundImage: 'linear-gradient(to right, rgb(255 255 255 / .35) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / .35) 1px, transparent 1px)',
                backgroundSize: `${tile}px ${tile}px`,
              }}
            />
          )}

          {buildings.map((b) => (
            <BuildingView key={b.id} b={b} now={now} tile={tile} dimmed={placement?.mode === 'move' && placement.id === b.id} readyOrders={readyOrders} />
          ))}

          {unlockedRows < rows && (
            <div className="locked-land absolute inset-x-0 bottom-0 rounded-b-3xl bg-meadow-600/25" style={{ top: unlockedRows * tile }}>
              {expansion && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onExpand()
                  }}
                  className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-cream px-3 py-1.5 text-sm font-semibold shadow-md active:scale-95"
                  style={{ top: tile * 0.5 }}
                >
                  <Sprite id="ui.land" className="h-6 w-6" />
                  {state.level < expansion.unlockLevel ? `Expand at Lv ${expansion.unlockLevel}` : <>Expand · <CoinTag amount={expansion.cost} /></>}
                </button>
              )}
            </div>
          )}

          {placement && <Ghost placement={placement} tile={tile} valid={valid} />}
          <FloatingFx fx={fx} tile={tile} />
        </div>
      </div>
    </div>
  )
}
