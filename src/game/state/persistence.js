import { SAVE_VERSION } from './initialState.js'
import { GRID } from '../config/index.js'

const KEY = 'meadowvale.save'

/** Upgrade older saves here when the state shape changes. */
export function migrate(save) {
  if (!save || typeof save !== 'object') return null
  if (save.version === 1) {
    // v2: map grew from 14 to 20 rows (new land expansions). Unlocked rows are kept.
    save = { ...save, version: 2, grid: { ...save.grid, rows: GRID.rows } }
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
