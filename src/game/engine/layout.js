/**
 * Spread an existing town out from its centre (used once, when the land doubles).
 * Connected field patches move as one unit so farms stay together; everything else
 * moves on its own. Units are placed centre-first into the nearest free spot to
 * their spread-out target.
 */
import { sizeOf } from './grid.js'

export function spreadLayout(buildings, land, factor = 1.4) {
  const list = Object.values(buildings)
  const fields = list.filter((b) => b.type === 'field')
  const fieldAt = new Map(fields.map((f) => [`${f.x},${f.y}`, f]))

  // Group fields into connected patches.
  const units = []
  const seen = new Set()
  for (const f of fields) {
    if (seen.has(f.id)) continue
    const patch = []
    const stack = [f]
    seen.add(f.id)
    while (stack.length) {
      const cur = stack.pop()
      patch.push(cur)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = fieldAt.get(`${cur.x + dx},${cur.y + dy}`)
        if (n && !seen.has(n.id)) {
          seen.add(n.id)
          stack.push(n)
        }
      }
    }
    units.push(patch)
  }
  for (const b of list) if (b.type !== 'field') units.push([b])

  const tilesOf = (unit, dx = 0, dy = 0) =>
    unit.flatMap((b) => {
      const [w, h] = sizeOf(b.type)
      const out = []
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.push([b.x + dx + i, b.y + dy + j])
      return out
    })

  const cx = (land.x0 + land.x1) / 2
  const cy = (land.y0 + land.y1) / 2
  const info = units.map((unit) => {
    const tiles = tilesOf(unit)
    const ux = tiles.reduce((n, [x]) => n + x + 0.5, 0) / tiles.length
    const uy = tiles.reduce((n, [, y]) => n + y + 0.5, 0) / tiles.length
    return { unit, dist: Math.hypot(ux - cx, uy - cy), tx: Math.round((ux - cx) * (factor - 1)), ty: Math.round((uy - cy) * (factor - 1)) }
  })
  info.sort((a, b) => a.dist - b.dist)

  const used = new Set()
  const fits = (unit, dx, dy) =>
    tilesOf(unit, dx, dy).every(([x, y]) => x >= land.x0 && y >= land.y0 && x < land.x1 && y < land.y1 && !used.has(`${x},${y}`))

  const out = {}
  for (const { unit, tx, ty } of info) {
    let best = null
    for (let r = 0; r <= 12 && !best; r++) {
      const ring = []
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r) ring.push([tx + dx, ty + dy])
      ring.sort((a, b) => Math.hypot(a[0] - tx, a[1] - ty) - Math.hypot(b[0] - tx, b[1] - ty))
      best = ring.find(([dx, dy]) => fits(unit, dx, dy)) ?? null
    }
    const [dx, dy] = best ?? [0, 0]
    for (const [x, y] of tilesOf(unit, dx, dy)) used.add(`${x},${y}`)
    for (const b of unit) out[b.id] = { ...b, x: b.x + dx, y: b.y + dy }
  }
  return out
}

/** Set of "x,y" tiles covered by buildings. */
export function occupiedTiles(buildings) {
  const set = new Set()
  for (const b of Object.values(buildings)) {
    const [w, h] = sizeOf(b.type)
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set.add(`${b.x + i},${b.y + j}`)
  }
  return set
}
