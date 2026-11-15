/**
 * The isometric town map.
 *
 * Layers (inside one scrollable sizer):
 *  1. world   – ground SVG (tiles, roads, island edge) + depth-sorted building sprites,
 *               laid out in world units and scaled with a single CSS transform.
 *  2. overlay – unscaled bubbles, progress bars, floating +1s and the expand sign.
 *
 * Input model
 *  - Normal mode: native scrolling pans, a tap selects the building under the finger
 *    (by its painted shape, so tall roofs are tappable) or else the tile.
 *  - Seed mode:   panning is disabled and drags "paint" across tiles.
 *  - Two fingers: pinch to zoom (ctrl/⌘ + wheel on desktop), anchored between the fingers.
 */
import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { BUILDINGS } from '../../game/config/index.js'
import { useGame } from '../../game/state/GameProvider.jsx'
import { canMove, canPlace, nextExpansion } from '../../game/state/rules.js'
import { computeRoads } from '../../game/engine/roads.js'
import { hash2, noise2, waterSet } from '../../game/engine/terrain.js'
import { occupiedTiles } from '../../game/engine/layout.js'
import { TW, buildingBox, depthSort, footprintBox, footprintPoints, toGrid, toScreen, worldSize } from '../../game/engine/iso.js'
import { CoinTag } from '../ui/primitives.jsx'
import Sprite from '../ui/Sprite.jsx'
import { BuildingStatus, WorldBuilding } from './BuildingView.jsx'

// Margins around the map diamond, in world units (room for tall buildings and the island edge).
const M_SIDE = 140
const M_TOP = 320
const M_BOTTOM = 260
const CLIFF = 70

function TreeArt({ x, y, big, tone = 0 }) {
  const greens = [['#5fae4f', '#7fcf68', '#6fbf5a'], ['#4f9e45', '#6fbf5a', '#5fae4f'], ['#6fbf5a', '#8fd877', '#7fcf68']][tone]
  return big ? (
    <g>
      <ellipse cx={x + 6} cy={y + 6} rx="38" ry="15" fill="#3d5a2a" opacity=".16" />
      <rect x={x - 6} y={y - 40} width="12" height="44" rx="5" fill="#8a5f41" />
      <circle cx={x} cy={y - 62} r="34" fill={greens[0]} />
      <circle cx={x - 18} cy={y - 50} r="20" fill={greens[2]} />
      <circle cx={x - 10} cy={y - 76} r="13" fill={greens[1]} />
    </g>
  ) : (
    <g>
      <ellipse cx={x + 4} cy={y + 4} rx="26" ry="10" fill="#3d5a2a" opacity=".14" />
      <circle cx={x - 10} cy={y - 8} r="15" fill={greens[2]} />
      <circle cx={x + 9} cy={y - 10} r="17" fill={greens[0]} />
      <circle cx={x + 1} cy={y - 19} r="11" fill={greens[1]} />
    </g>
  )
}

function FlowerPatch({ x, y, seed }) {
  const colors = ['#ff8fa3', '#ffd45c', '#cbbcf5', '#ffffff']
  return (
    <g>
      {[[-14, -2], [0, -8], [12, 0], [-4, 6]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r="5" fill={colors[(seed + i) % colors.length]} />
      ))}
    </g>
  )
}

/** Static ground: island edge, grass, river, roads & bridges, groves and forest. */
const Ground = memo(function Ground({ grid, roads, showGrid, terrain, occupied }) {
  const { cols, rows, land } = grid
  const { width, height } = worldSize(grid)
  const seed = terrain?.seed ?? 1
  const water = waterSet(terrain)
  const P = (x, y) => toScreen(grid, x, y)
  const pt = (x, y, dy = 0) => {
    const p = P(x, y)
    return `${p.x},${p.y + dy}`
  }
  const onLand = (x, y) => x >= land.x0 && y >= land.y0 && x < land.x1 && y < land.y1
  const isRoad = (x, y) => roads.tiles.has(`${x},${y}`) || roads.exitSet.has(`${x},${y}`)
  const isWater = (x, y) => water.has(`${x},${y}`)
  const isBuilt = (x, y) => occupied.has(`${x},${y}`)
  const cx = (land.x0 + land.x1) / 2
  const cy = (land.y0 + land.y1) / 2
  const half = Math.max(land.x1 - land.x0, land.y1 - land.y0) / 2

  const tiles = []
  const waterTiles = []
  const nature = [] // [depth, element]
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = `${x},${y}`
      if (isWater(x, y)) {
        waterTiles.push([x, y])
        continue
      }
      const lit = onLand(x, y)
      const odd = (x + y) % 2
      const fill = lit ? (odd ? '#aadb88' : '#b3e293') : odd ? '#93c66f' : '#9bcd77'
      tiles.push(<polygon key={k} points={footprintPoints(grid, x, y, 1, 1)} fill={fill} />)
      if (isRoad(x, y) || isBuilt(x, y)) continue

      const c = toScreen(grid, x + 0.5, y + 0.5)
      const h = hash2(x, y, seed)
      const n = noise2(x, y, seed, 3.5)
      if (!lit) {
        if (n > 0.42 || h < 0.08) nature.push([x + y, <TreeArt key={k} x={c.x} y={c.y} big={h < 0.55} tone={Math.floor(h * 3)} />])
        else if (h < 0.35) nature.push([x + y, <TreeArt key={k} x={c.x} y={c.y} big={false} tone={2} />])
        continue
      }
      // Groves on unused land: denser towards the edges, never right behind a building
      // (its canopy would poke out from behind the roof).
      const edge = Math.max(Math.abs(x + 0.5 - cx), Math.abs(y + 0.5 - cy)) / half
      const clearBehind = !isBuilt(x - 1, y) && !isBuilt(x, y - 1) && !isBuilt(x - 1, y - 1)
      if (clearBehind && n > 0.72 - 0.22 * edge) {
        nature.push([x + y, <TreeArt key={k} x={c.x} y={c.y} big={h < 0.45} tone={Math.floor(h * 3)} />])
      } else if (h < 0.05) {
        nature.push([x + y, <FlowerPatch key={k} x={c.x} y={c.y} seed={Math.floor(h * 1000)} />])
      }
    }
  }
  nature.sort((a, b) => a[0] - b[0])

  // River: water diamonds, sandy banks on dry edges, a few ripples.
  const sides = (x, y) => [
    [0, -1, [x, y], [x + 1, y]],
    [1, 0, [x + 1, y], [x + 1, y + 1]],
    [0, 1, [x + 1, y + 1], [x, y + 1]],
    [-1, 0, [x, y + 1], [x, y]],
  ]
  const banks = []
  const ripples = []
  for (const [x, y] of waterTiles) {
    for (const [dx, dy, a, b] of sides(x, y)) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || isWater(nx, ny)) continue
      const p = P(...a)
      const q = P(...b)
      banks.push(<line key={`b${x},${y},${dx},${dy}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#efdcb4" strokeWidth="14" strokeLinecap="round" />)
    }
    if (hash2(x, y, seed + 7) < 0.35) {
      const c = toScreen(grid, x + 0.5, y + 0.5)
      ripples.push(<path key={`w${x},${y}`} d={`M${c.x - 18} ${c.y} q9 -6 18 0 q9 6 18 0`} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />)
    }
  }

  const roadTiles = [...roads.tiles, ...roads.exitSet].map((k) => k.split(',').map(Number))
  const curbs = []
  for (const [x, y] of roadTiles) {
    for (const [dx, dy, a, b] of sides(x, y)) {
      if (isRoad(x + dx, y + dy)) continue
      const p = P(...a)
      const q = P(...b)
      const bridge = roads.bridges.has(`${x},${y}`)
      curbs.push(
        <line key={`c${x},${y},${dx},${dy}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={bridge ? '#8a5f41' : '#d4bd96'} strokeWidth={bridge ? 10 : 7} strokeLinecap="round" />,
      )
    }
  }

  return (
    <svg className="pointer-events-none absolute" style={{ left: M_SIDE, top: M_TOP, width, height: height + CLIFF, overflow: 'visible' }} viewBox={`0 0 ${width} ${height + CLIFF}`}>
      {/* island edge */}
      <polygon points={`${pt(0, rows)} ${pt(cols, rows)} ${pt(cols, rows, CLIFF)} ${pt(0, rows, CLIFF)}`} fill="#c99b72" />
      <polygon points={`${pt(cols, 0)} ${pt(cols, rows)} ${pt(cols, rows, CLIFF)} ${pt(cols, 0, CLIFF)}`} fill="#a7744d" />
      <polygon points={`${pt(0, rows)} ${pt(cols, rows)} ${pt(cols, rows, 16)} ${pt(0, rows, 16)}`} fill="#78b956" />
      <polygon points={`${pt(cols, 0)} ${pt(cols, rows)} ${pt(cols, rows, 16)} ${pt(cols, 0, 16)}`} fill="#5e9c43" />
      {tiles}
      {banks}
      {waterTiles.map(([x, y]) => (
        <polygon key={`w${x},${y}`} points={footprintPoints(grid, x, y, 1, 1)} fill="#8fd0f5" stroke="#8fd0f5" strokeWidth="2" />
      ))}
      {ripples}
      {roadTiles.map(([x, y]) => {
        const bridge = roads.bridges.has(`${x},${y}`)
        const fill = bridge ? '#c8925f' : onLand(x, y) ? '#ead9b9' : '#dcc9a6'
        return <polygon key={`r${x},${y}`} points={footprintPoints(grid, x, y, 1, 1)} fill={fill} stroke={fill} strokeWidth="1.5" />
      })}
      {[...roads.bridges].map((k) => {
        const [x, y] = k.split(',').map(Number)
        return [0.25, 0.5, 0.75].map((t) => {
          const a = P(x + t, y)
          const b = P(x + t, y + 1)
          return <line key={`p${k}${t}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#a47551" strokeWidth="4" />
        })
      })}
      {curbs}
      <polygon points={footprintPoints(grid, land.x0, land.y0, land.x1 - land.x0, land.y1 - land.y0)} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="6" strokeDasharray="22 14" strokeLinejoin="round" />
      {showGrid && (
        <g stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none">
          {Array.from({ length: land.x1 - land.x0 + 1 }, (_, i) => {
            const a = P(land.x0 + i, land.y0)
            const b = P(land.x0 + i, land.y1)
            return <line key={`gx${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          })}
          {Array.from({ length: land.y1 - land.y0 + 1 }, (_, i) => {
            const a = P(land.x0, land.y0 + i)
            const b = P(land.x1, land.y0 + i)
            return <line key={`gy${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          })}
        </g>
      )}
      <g opacity={showGrid ? 0.45 : 1}>{nature.map(([, el]) => el)}</g>
    </svg>
  )
})

function FloatingFx({ fx, grid, scale }) {
  return fx.map((f) => {
    const p = toScreen(grid, f.x, f.y)
    return (
      <div
        key={f.key}
        className="pointer-events-none absolute flex animate-float-up items-center gap-0.5 whitespace-nowrap rounded-full bg-white/95 px-2 py-0.5 text-sm font-bold text-ink shadow-md"
        style={{ left: (M_SIDE + p.x) * scale, top: (M_TOP + p.y - 150) * scale, zIndex: 10 }}
      >
        {f.sprite && <Sprite id={f.sprite} className="h-5 w-5" />}
        {f.text}
      </div>
    )
  })
}

export default function TownGrid({ tile, onZoom, placement, seedMode, onTap, onPaint, onExpand, fx, readyOrders }) {
  const { state, now } = useGame()
  const { grid } = state
  const scale = tile / TW
  const world = worldSize(grid)
  const totalW = world.width + M_SIDE * 2
  const totalH = world.height + M_TOP + M_BOTTOM

  const scrollRef = useRef(null)
  const worldRef = useRef(null)
  const stroke = useRef(null)
  const anchor = useRef(null)
  const prevScale = useRef(scale)
  const scaleRef = useRef(scale)
  const tileRef = useRef(tile)
  const zoomRef = useRef(onZoom)
  scaleRef.current = scale
  tileRef.current = tile
  zoomRef.current = onZoom

  const roads = useMemo(() => {
    const r = computeRoads(state)
    return { tiles: r.tiles, bridges: r.bridges, exitSet: new Set(r.exit.map(([x, y]) => `${x},${y}`)) }
    // Roads only depend on layout, not on timers or inventory.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.buildings, state.grid])

  const sorted = useMemo(() => depthSort(Object.values(state.buildings)), [state.buildings])
  const occupied = useMemo(() => occupiedTiles(state.buildings), [state.buildings])

  // Start centered on the middle of town.
  useLayoutEffect(() => {
    const el = scrollRef.current
    const { land } = grid
    const c = toScreen(grid, (land.x0 + land.x1) / 2, (land.y0 + land.y1) / 2)
    el.scrollLeft = (M_SIDE + c.x) * scale - el.clientWidth / 2
    el.scrollTop = (M_TOP + c.y - 60) * scale - el.clientHeight / 2
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the anchored point (fingers / screen center) still while zooming.
  useLayoutEffect(() => {
    const el = scrollRef.current
    const s0 = prevScale.current
    prevScale.current = scale
    if (s0 === scale) return
    const a = anchor.current ?? { mx: el.clientWidth / 2, my: el.clientHeight / 2 }
    anchor.current = null
    el.scrollLeft = ((el.scrollLeft + a.mx) * scale) / s0 - a.mx
    el.scrollTop = ((el.scrollTop + a.my) * scale) / s0 - a.my
  }, [scale])

  useEffect(() => {
    const el = scrollRef.current
    let pinch = null
    const read = (e) => {
      const [p, q] = e.touches
      const r = el.getBoundingClientRect()
      return { d: Math.hypot(p.clientX - q.clientX, p.clientY - q.clientY), mx: (p.clientX + q.clientX) / 2 - r.left, my: (p.clientY + q.clientY) / 2 - r.top }
    }
    const start = (e) => {
      if (e.touches.length !== 2) return
      e.preventDefault()
      pinch = { ...read(e), tile: tileRef.current }
    }
    const move = (e) => {
      if (!pinch || e.touches.length !== 2) return
      e.preventDefault()
      const cur = read(e)
      anchor.current = { mx: cur.mx, my: cur.my }
      zoomRef.current(pinch.tile * (cur.d / pinch.d))
    }
    const end = (e) => {
      if (e.touches.length < 2) pinch = null
    }
    const wheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      anchor.current = { mx: e.clientX - r.left, my: e.clientY - r.top }
      zoomRef.current(tileRef.current * Math.exp(-e.deltaY * 0.01))
    }
    const block = (e) => e.preventDefault()
    el.addEventListener('touchstart', start, { passive: false })
    el.addEventListener('touchmove', move, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    el.addEventListener('wheel', wheel, { passive: false })
    el.addEventListener('gesturestart', block)
    return () => {
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
      el.removeEventListener('wheel', wheel)
      el.removeEventListener('gesturestart', block)
    }
  }, [])

  const tileFromEvent = (e) => {
    const r = worldRef.current.getBoundingClientRect()
    const ux = (e.clientX - r.left) / scaleRef.current - M_SIDE
    const uy = (e.clientY - r.top) / scaleRef.current - M_TOP
    const g = toGrid(grid, ux, uy)
    const x = Math.floor(g.x)
    const y = Math.floor(g.y)
    const { land } = grid
    return x >= land.x0 && y >= land.y0 && x < land.x1 && y < land.y1 ? { x, y } : null
  }

  const handleClick = (e) => {
    if (seedMode) return
    const hit = e.target.closest?.('[data-bid]')
    const t = tileFromEvent(e)
    if (hit && !placement) return onTap(t?.x, t?.y, hit.dataset.bid)
    if (t) onTap(t.x, t.y, null)
  }

  const paint = (e) => {
    const t = tileFromEvent(e)
    if (!t) return
    const k = `${t.x},${t.y}`
    if (stroke.current.has(k)) return
    stroke.current.add(k)
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
  const landFull = grid.land.x0 === 0 && grid.land.y0 === 0 && grid.land.x1 === grid.cols && grid.land.y1 === grid.rows
  const signAt = toScreen(grid, grid.land.x1, grid.land.y1)

  const offsetBox = (box) => ({ ...box, left: box.left + M_SIDE, top: box.top + M_TOP })

  return (
    <div ref={scrollRef} className="no-scrollbar absolute inset-0 isolate overflow-auto" style={{ touchAction: seedMode ? 'none' : 'pan-x pan-y' }}>
      <div className="relative" style={{ width: totalW * scale, height: totalH * scale }}>
        <div
          ref={worldRef}
          onClick={handleClick}
          {...pointerHandlers}
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: totalW, height: totalH, transform: `scale(${scale})` }}
        >
          <Ground grid={grid} roads={roads} showGrid={Boolean(placement)} terrain={state.terrain} occupied={occupied} />
          {sorted.map((b, i) => (
            <WorldBuilding
              key={b.id}
              b={b}
              now={b.type === 'field' || b.animals ? now : 0}
              box={offsetBox(buildingBox(grid, b))}
              scale={1}
              z={i + 1}
              dimmed={placement?.mode === 'move' && placement.id === b.id}
            />
          ))}
          {placement && <Ghost placement={placement} grid={grid} valid={valid} />}
        </div>

        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }}>
          {!placement &&
            sorted.map((b) => (
              <BuildingStatus
                key={b.id}
                b={b}
                now={now}
                box={offsetBox(buildingBox(grid, b))}
                scale={scale}
                tile={tile}
                readyOrders={readyOrders}
                inventory={state.inventory}
                onTap={() => onTap(b.x, b.y, b.id)}
              />
            ))}
          <FloatingFx fx={fx} grid={grid} scale={scale} />
          {!landFull && expansion && (
            <button
              onClick={onExpand}
              className="pointer-events-auto absolute flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-cream px-3 py-1.5 text-sm font-semibold shadow-md active:scale-95"
              style={{ left: (M_SIDE + signAt.x) * scale, top: (M_TOP + signAt.y + 36) * scale }}
            >
              <Sprite id="ui.land" className="h-6 w-6" />
              {state.level < expansion.unlockLevel ? `Expand at Lv ${expansion.unlockLevel}` : <>Expand · <CoinTag amount={expansion.cost} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Ghost({ placement, grid, valid }) {
  const [w, h] = BUILDINGS[placement.type].size
  const box = footprintBox(grid, placement.x, placement.y, w, h)
  const { width, height } = worldSize(grid)
  return (
    <>
      <svg className="pointer-events-none absolute" style={{ left: M_SIDE, top: M_TOP, width, height, zIndex: 998, overflow: 'visible' }} viewBox={`0 0 ${width} ${height}`}>
        <polygon
          points={footprintPoints(grid, placement.x, placement.y, w, h)}
          fill={valid ? 'rgb(120 185 86 / .6)' : 'rgb(242 102 127 / .6)'}
          stroke={valid ? '#3f7f2a' : '#e04563'}
          strokeWidth="9"
          strokeDasharray="18 10"
          strokeLinejoin="round"
        />
      </svg>
      <div className="pointer-events-none absolute animate-bob opacity-90" style={{ left: box.left + M_SIDE, top: box.top + M_TOP, width: box.width, height: box.height, zIndex: 999 }}>
        <Sprite id={`building.${placement.type}`} />
      </div>
    </>
  )
}
