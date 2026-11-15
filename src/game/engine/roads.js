/**
 * Automatic, purely cosmetic roads.
 *
 * The Order Board is the town square. Every home, factory and pen gets a road from
 * one of its front doors (the tiles along its +x / +y edges, which face the camera)
 * to the network, and one main road leads from the network out of town. Roads only
 * use free tiles, so they reroute whenever the layout changes and never block building.
 */
import { BUILDINGS } from '../config/index.js'
import { sizeOf } from './grid.js'
import { waterSet } from './terrain.js'

const NEEDS_ROAD = new Set(['housing', 'factory', 'animals', 'special'])
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]
const TURN_COST = 0.6
const BRIDGE_COST = 4 // crossing water is allowed (as a bridge) but discouraged

/** Minimal binary heap keyed on `cost`. */
class Heap {
  items = []
  push(v) {
    const a = this.items
    a.push(v)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (a[p].cost <= a[i].cost) break
      ;[a[p], a[i]] = [a[i], a[p]]
      i = p
    }
  }
  pop() {
    const a = this.items
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l].cost < a[m].cost) m = l
        if (r < a.length && a[r].cost < a[m].cost) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
  get size() {
    return this.items.length
  }
}

/** Cheapest path (preferring straight lines) from any source to any target tile, target included. */
function findPath(sources, isTarget, stepCost, cols) {
  const best = new Map()
  const heap = new Heap()
  for (const [x, y] of sources) heap.push({ x, y, dir: -1, cost: 0, prev: null })
  while (heap.size) {
    const node = heap.pop()
    const k = `${node.x},${node.y},${node.dir}`
    if (best.has(k)) continue
    best.set(k, node)
    if (isTarget(node.x, node.y)) {
      const path = []
      for (let n = node; n; n = n.prev) path.push([n.x, n.y])
      return path.reverse() // source … target
    }
    DIRS.forEach(([dx, dy], dir) => {
      const nx = node.x + dx
      const ny = node.y + dy
      if (nx < 0 || ny < 0 || nx >= cols) return
      const step = isTarget(nx, ny) ? 1 : stepCost(nx, ny)
      if (!Number.isFinite(step)) return
      const turn = node.dir !== -1 && node.dir !== dir ? TURN_COST : 0
      heap.push({ x: nx, y: ny, dir, cost: node.cost + step + turn, prev: node })
    })
  }
  return null
}

export function computeRoads(state) {
  const { cols, rows, land } = state.grid
  const occupied = new Uint8Array(cols * rows)
  const buildings = Object.values(state.buildings)
  for (const b of buildings) {
    const [w, h] = sizeOf(b.type)
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) occupied[(b.y + dy) * cols + b.x + dx] = 1
  }
  const water = waterSet(state.terrain)
  const onLand = (x, y) => x >= land.x0 && y >= land.y0 && x < land.x1 && y < land.y1
  const wet = (x, y) => water.has(`${x},${y}`)
  const free = (x, y) => onLand(x, y) && !occupied[y * cols + x] && !wet(x, y)
  const cost = (x, y) => (onLand(x, y) && !occupied[y * cols + x] ? (wet(x, y) ? BRIDGE_COST : 1) : Infinity)
  const doorsOf = (b) => {
    const [w, h] = sizeOf(b.type)
    const out = []
    for (let i = 0; i < w; i++) out.push([b.x + i, b.y + h])
    for (let j = 0; j < h; j++) out.push([b.x + w, b.y + j])
    return out.filter(([x, y]) => free(x, y))
  }

  const road = new Set()
  const key = (x, y) => `${x},${y}`
  const cx = (land.x0 + land.x1) / 2
  const cy = (land.y0 + land.y1) / 2
  const dist = ([x, y]) => Math.hypot(x - cx, y - cy)

  // Seed the network at the town square.
  const board = buildings.find((b) => b.type === 'board')
  let seed = board ? doorsOf(board).sort((a, b) => dist(a) - dist(b))[0] : null
  if (!seed) {
    const all = []
    for (let y = land.y0; y < land.y1; y++) for (let x = land.x0; x < land.x1; x++) if (free(x, y)) all.push([x, y])
    seed = all.sort((a, b) => dist(a) - dist(b))[0]
  }
  if (!seed) return { tiles: road, exit: [], bridges: new Set() }
  road.add(key(...seed))

  const inRoad = (x, y) => road.has(key(x, y))
  const users = buildings
    .filter((b) => b !== board && NEEDS_ROAD.has(BUILDINGS[b.type].category))
    .map((b) => ({ b, d: Math.hypot(b.x - seed[0], b.y - seed[1]) }))
    .sort((a, b) => a.d - b.d)

  for (const { b } of users) {
    const doors = doorsOf(b)
    if (!doors.length || doors.some(([x, y]) => inRoad(x, y))) continue
    const path = findPath(doors, inRoad, cost, cols)
    if (path) for (const [x, y] of path) road.add(key(x, y))
  }

  // Main road out of town: from the network to the front (+y) edge of the land,
  // then straight on through locked land to the map edge.
  const exit = []
  const edgeRow = land.y1 - 1
  const network = [...road].map((k) => k.split(',').map(Number))
  const toEdge = findPath(network, (x, y) => y === edgeRow && free(x, y), cost, cols)
  if (toEdge) {
    for (const [x, y] of toEdge) road.add(key(x, y))
    const [gx] = toEdge[toEdge.length - 1]
    for (let y = land.y1; y < rows; y++) exit.push([gx, y])
  }

  const bridges = new Set([...road, ...exit.map(([x, y]) => key(x, y))].filter((k) => water.has(k)))
  return { tiles: road, exit, bridges }
}
