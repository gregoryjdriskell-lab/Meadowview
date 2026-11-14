import { BUILDINGS } from '../config/index.js'

export const sizeOf = (type) => BUILDINGS[type].size

/** Returns the building occupying tile (x, y), or null. */
export function buildingAt(state, x, y) {
  for (const b of Object.values(state.buildings)) {
    const [w, h] = sizeOf(b.type)
    if (x >= b.x && x < b.x + w && y >= b.y && y < b.y + h) return b
  }
  return null
}

/** True when the w*h footprint at (x, y) is entirely on unlocked land. */
export function inBounds(state, x, y, w, h) {
  const l = state.grid.land
  return x >= l.x0 && y >= l.y0 && x + w <= l.x1 && y + h <= l.y1
}

export const isLand = (state, x, y) => inBounds(state, x, y, 1, 1)

/** The unlocked rectangle after one more expansion (one tile per side, clamped to the map). */
export function expandedLand(grid) {
  const { land, cols, rows } = grid
  return { x0: Math.max(0, land.x0 - 1), y0: Math.max(0, land.y0 - 1), x1: Math.min(cols, land.x1 + 1), y1: Math.min(rows, land.y1 + 1) }
}

export const isLandFull = (grid) => grid.land.x0 === 0 && grid.land.y0 === 0 && grid.land.x1 === grid.cols && grid.land.y1 === grid.rows

/** A centered size*size plot on a cols*rows map. */
export function centeredLand(cols, rows, size) {
  const x0 = Math.floor((cols - size) / 2)
  const y0 = Math.floor((rows - size) / 2)
  return { x0, y0, x1: x0 + size, y1: y0 + size }
}

/** True when a w*h footprint at (x, y) is on unlocked land and overlaps nothing (except `ignoreId`). */
export function isAreaFree(state, x, y, w, h, ignoreId = null) {
  if (!inBounds(state, x, y, w, h)) return false
  for (const b of Object.values(state.buildings)) {
    if (b.id === ignoreId) continue
    const [bw, bh] = sizeOf(b.type)
    if (x < b.x + bw && x + w > b.x && y < b.y + bh && y + h > b.y) return false
  }
  return true
}

/** Free spot for a building type closest to `hint` (default: the middle of town). */
export function findFreeSpot(state, type, hint = null) {
  const [w, h] = sizeOf(type)
  const l = state.grid.land
  const target = hint ?? { x: (l.x0 + l.x1 - w) / 2, y: (l.y0 + l.y1 - h) / 2 }
  const candidates = []
  for (let y = l.y0; y <= l.y1 - h; y++) {
    for (let x = l.x0; x <= l.x1 - w; x++) candidates.push([x, y])
  }
  candidates.sort((a, b) => Math.hypot(a[0] - target.x, a[1] - target.y) - Math.hypot(b[0] - target.x, b[1] - target.y))
  const hit = candidates.find(([x, y]) => isAreaFree(state, x, y, w, h))
  return hit ? { x: hit[0], y: hit[1] } : null
}

/** Clamp a footprint's origin so it stays inside the unlocked land. */
export function clampToGrid(state, type, x, y) {
  const [w, h] = sizeOf(type)
  const l = state.grid.land
  return {
    x: Math.max(l.x0, Math.min(x, l.x1 - w)),
    y: Math.max(l.y0, Math.min(y, l.y1 - h)),
  }
}

export const countOf = (state, type) => Object.values(state.buildings).filter((b) => b.type === type).length
