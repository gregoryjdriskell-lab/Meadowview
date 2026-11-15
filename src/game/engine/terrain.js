/**
 * Natural terrain: a river through one corner of the property, plus deterministic
 * noise used to scatter groves, bushes and flowers.
 *
 * The river is generated once per save and stored (state.terrain.water) so it never
 * shifts under existing buildings. Trees and flowers are derived from the seed on
 * the fly and only appear on tiles nobody is using, so they never get in the way.
 */
import { makeRng } from './rng.js'

const cache = new WeakMap()
/** Set of "x,y" water tiles (cached per terrain object). */
export function waterSet(terrain) {
  if (!terrain?.water) return EMPTY
  let set = cache.get(terrain.water)
  if (!set) {
    set = new Set(terrain.water)
    cache.set(terrain.water, set)
  }
  return set
}
const EMPTY = new Set()

/** Stable pseudo-random value in [0, 1) for a tile. */
export function hash2(x, y, seed = 0) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/** Smooth value noise: neighbouring tiles get similar values, so trees form groves. */
export function noise2(x, y, seed, scale = 4) {
  const fx = x / scale
  const fy = y / scale
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const tx = fx - x0
  const ty = fy - y0
  const s = (t) => t * t * (3 - 2 * t)
  const a = hash2(x0, y0, seed)
  const b = hash2(x0 + 1, y0, seed)
  const c = hash2(x0, y0 + 1, seed)
  const d = hash2(x0 + 1, y0 + 1, seed)
  return a + (b - a) * s(tx) + (c - a) * s(ty) + (a - b - c + d) * s(tx) * s(ty)
}

/** Chaikin corner-cutting to round off a polyline. */
function smooth(points, rounds = 3) {
  let pts = points
  for (let r = 0; r < rounds; r++) {
    const out = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]
      const [bx, by] = pts[i + 1]
      out.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75])
    }
    out.push(pts[pts.length - 1])
    pts = out
  }
  return pts
}

/**
 * A river that enters from one map edge, bends through `waypoint` (near a corner of
 * the land), and leaves through the neighbouring edge. Two tiles wide.
 */
function riverTiles(grid, corner, inset, rng) {
  const { cols, rows, land } = grid
  const [cx, cy] = corner // 0 = low side, 1 = high side
  // Work in corner-local coordinates (u, v grow away from the map corner).
  const lu = cx ? cols - land.x1 : land.x0
  const lv = cy ? rows - land.y1 : land.y0
  const wu = lu + inset
  const wv = lv + inset
  const toGlobal = ([u, v]) => [cx ? cols - u : u, cy ? rows - v : v]
  const e1 = [wu + 3 + rng.int(5), -1]
  const e2 = [-1, wv + 3 + rng.int(5)]
  const mid1 = [(e1[0] + wu) / 2 + rng() * 2 - 1, (e1[1] + wv) / 2 + rng() * 2 - 1]
  const mid2 = [(e2[0] + wu) / 2 + rng() * 2 - 1, (e2[1] + wv) / 2 + rng() * 2 - 1]
  const path = smooth([e1, mid1, [wu, wv], mid2, e2]).map(toGlobal)

  const tiles = new Set()
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = path[i]
    const [bx, by] = path[i + 1]
    const len = Math.hypot(bx - ax, by - ay)
    const steps = Math.max(1, Math.ceil(len * 4))
    // Perpendicular, to make the river two tiles wide.
    const px = len ? -(by - ay) / len : 0
    const py = len ? (bx - ax) / len : 0
    for (let k = 0; k <= steps; k++) {
      const x = ax + ((bx - ax) * k) / steps
      const y = ay + ((by - ay) * k) / steps
      for (const off of [-0.45, 0.55]) {
        const tx = Math.floor(x + px * off)
        const ty = Math.floor(y + py * off)
        if (tx >= 0 && ty >= 0 && tx < cols && ty < rows) tiles.add(`${tx},${ty}`)
      }
    }
  }
  return tiles
}

/**
 * Generate terrain for a map, keeping the river clear of every existing building.
 * Prefers a river that cuts through the land's corner; falls back to one just
 * outside the land if the town fills every corner.
 */
export function generateTerrain(grid, buildingTiles, seed) {
  const rng = makeRng(seed)
  const corners = [[1, 1], [1, 0], [0, 1], [0, 0]]
  // Shuffle corners, but favour the two front corners (they look best from the camera).
  corners.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) + (rng() - 0.5) * 1.5).reverse()
  for (const inset of [3, 2, 1, -2, -4]) {
    for (const corner of corners) {
      const tiles = riverTiles(grid, corner, inset, rng)
      if (![...tiles].some((t) => buildingTiles.has(t))) return { seed, water: [...tiles] }
    }
  }
  return { seed, water: [] }
}
