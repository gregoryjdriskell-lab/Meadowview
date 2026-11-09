import { SAVE_VERSION } from './initialState.js'

const KEY = 'meadowvale.save'

/** Upgrade older saves here when the state shape changes. */
function migrate(save) {
  if (save?.version === SAVE_VERSION) return save
  return null
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
