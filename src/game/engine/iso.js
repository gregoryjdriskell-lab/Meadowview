/**
 * Isometric projection. Everything is in "world units": a tile is a diamond
 * TW wide and TH tall. Sprite art uses the same units, so a building with a
 * w*h footprint is drawn in a square (w+h)*100 box with its diamond at the bottom.
 * The renderer multiplies world units by (tilePx / TW).
 */
import { BUILDINGS } from '../config/index.js'

export const TW = 200
export const TH = 100

export const worldSize = (grid) => ({ width: ((grid.cols + grid.rows) * TW) / 2, height: ((grid.cols + grid.rows) * TH) / 2 })

/** Screen position (world units) of grid corner (gx, gy). */
export const toScreen = (grid, gx, gy) => ({ x: (grid.rows * TW) / 2 + ((gx - gy) * TW) / 2, y: ((gx + gy) * TH) / 2 })

/** Fractional grid position under a screen point (world units). Floor it for a tile. */
export function toGrid(grid, sx, sy) {
  const a = (sx - (grid.rows * TW) / 2) / (TW / 2)
  const b = sy / (TH / 2)
  return { x: (a + b) / 2, y: (b - a) / 2 }
}

/** The square sprite box for a footprint at (x, y), bottom-aligned to the footprint diamond. */
export function footprintBox(grid, x, y, w, h) {
  const size = ((w + h) * TW) / 2
  const bottom = toScreen(grid, x + w, y + h).y
  return { left: toScreen(grid, x, y + h).x, top: bottom - size, width: size, height: size }
}

export const buildingBox = (grid, b) => footprintBox(grid, b.x, b.y, ...BUILDINGS[b.type].size)

/** Diamond outline of a footprint as an SVG points string (world units). */
export function footprintPoints(grid, x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    .map(([gx, gy]) => {
      const p = toScreen(grid, gx, gy)
      return `${p.x},${p.y}`
    })
    .join(' ')
}

/**
 * Painter's order for non-overlapping footprints: B is drawn after A when B lies
 * entirely in front of A along x or y (and not the other way round).
 */
export function depthSort(buildings) {
  const list = [...buildings]
  const fp = list.map((b) => {
    const [w, h] = BUILDINGS[b.type].size
    return { x0: b.x, y0: b.y, x1: b.x + w, y1: b.y + h }
  })
  const inFront = (a, b) => b.x0 >= a.x1 || b.y0 >= a.y1 // b in front of a
  const n = list.length
  const after = Array.from({ length: n }, () => [])
  const indeg = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      if (inFront(fp[i], fp[j]) && !inFront(fp[j], fp[i])) {
        after[i].push(j)
        indeg[j] += 1
      }
    }
  }
  const key = (i) => fp[i].x0 + fp[i].x1 + fp[i].y0 + fp[i].y1
  const ready = [...Array(n).keys()].filter((i) => indeg[i] === 0)
  const out = []
  while (out.length < n) {
    if (!ready.length) {
      // Defensive: break any cycle with the simple depth key.
      const rest = [...Array(n).keys()].filter((i) => !out.includes(list[i]))
      rest.sort((a, b) => key(a) - key(b))
      for (const i of rest) out.push(list[i])
      break
    }
    ready.sort((a, b) => key(a) - key(b))
    const i = ready.shift()
    out.push(list[i])
    for (const j of after[i]) if (--indeg[j] === 0) ready.push(j)
  }
  return out
}
