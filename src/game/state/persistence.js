import { SAVE_VERSION } from './initialState.js'
import { GRID } from '../config/index.js'

const KEY = 'meadowvale.save'

/** Upgrade older saves here when the state shape changes. */
export function migrate(save) {
  if (!save || typeof save !== 'object') return null
  if (save.version === 1 || save.version === 2) {
    // v3: isometric square map. The old 10-wide strip (unlockedRows tall) is moved
    // into the middle of the square map, so every building keeps its layout.
    const cols = save.grid?.cols ?? 10
    const rows = Math.min(save.grid?.unlockedRows ?? 8, GRID.rows)
    const ox = Math.floor((GRID.cols - cols) / 2)
    const oy = Math.floor((GRID.rows - rows) / 2)
    const buildings = Object.fromEntries(Object.entries(save.buildings).map(([id, b]) => [id, { ...b, x: b.x + ox, y: b.y + oy }]))
    save = {
      ...save,
      version: 3,
      buildings,
      grid: { cols: GRID.cols, rows: GRID.rows, land: { x0: ox, y0: oy, x1: ox + cols, y1: oy + rows } },
    }
  }
  return save.version === SAVE_VERSION ? save : null
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? migrate(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Private mode / storage full: the game still runs, it just won't persist.
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
