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

export function inBounds(state, x, y, w, h) {
  return x >= 0 && y >= 0 && x + w <= state.grid.cols && y + h <= state.grid.unlockedRows
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

/** First free spot for a building type, scanning row by row (optionally near a hint). */
export function findFreeSpot(state, type, hint = null) {
  const [w, h] = sizeOf(type)
  const candidates = []
  for (let y = 0; y <= state.grid.unlockedRows - h; y++) {
    for (let x = 0; x <= state.grid.cols - w; x++) candidates.push([x, y])
  }
  if (hint) {
    candidates.sort((a, b) => Math.hypot(a[0] - hint.x, a[1] - hint.y) - Math.hypot(b[0] - hint.x, b[1] - hint.y))
  }
  const hit = candidates.find(([x, y]) => isAreaFree(state, x, y, w, h))
  return hit ? { x: hit[0], y: hit[1] } : null
}

/** Clamp a top-left position so the footprint stays inside the unlocked area. */
export function clampToGrid(state, type, x, y) {
  const [w, h] = sizeOf(type)
  return {
    x: Math.max(0, Math.min(x, state.grid.cols - w)),
    y: Math.max(0, Math.min(y, state.grid.unlockedRows - h)),
  }
}

export const countOf = (state, type) => Object.values(state.buildings).filter((b) => b.type === type).length
