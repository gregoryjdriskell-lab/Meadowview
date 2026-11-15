import { SAVE_VERSION, STARTER_BOOSTERS, makePlayerId } from './initialState.js'
import { clientForItems } from '../engine/orders.js'
import { expandedLand } from '../engine/grid.js'
import { generateTerrain } from '../engine/terrain.js'
import { occupiedTiles, spreadLayout } from '../engine/layout.js'
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
  if (save.version === 3) {
    // v4: businesses & reputation. Existing orders are assigned to the best-matching business.
    save = {
      ...save,
      version: 4,
      reputation: {},
      boosters: { ...STARTER_BOOSTERS },
      pendingRepUps: [],
      orders: save.orders.map((o) => {
        const client = clientForItems(o.items)
        return { ...o, client }
      }),
    }
  }
  if (save.version === 4) {
    // v5: neighbour help links need a player identity and some bookkeeping.
    save = {
      ...save,
      version: 5,
      profile: { id: makePlayerId(), name: '' },
      helpRequests: [],
      sentGifts: [],
      redeemed: [],
      stats: { helpsGiven: 0, helpsReceived: 0, ...save.stats },
    }
  }
  if (save.version === 5) {
    // v6: twice the room. The map grows to 30x30, your land grows by 2 tiles per side,
    // the town is spread out from its centre, and a river is carved around it.
    const shift = Math.floor((GRID.cols - save.grid.cols) / 2)
    const moved = Object.fromEntries(Object.entries(save.buildings).map(([id, b]) => [id, { ...b, x: b.x + shift, y: b.y + shift }]))
    const l = save.grid.land
    const grid = { cols: GRID.cols, rows: GRID.rows, land: { x0: l.x0 + shift, y0: l.y0 + shift, x1: l.x1 + shift, y1: l.y1 + shift } }
    grid.land = expandedLand(grid, 2)
    const buildings = spreadLayout(moved, grid.land)
    const terrain = generateTerrain(grid, occupiedTiles(buildings), Math.floor(Math.random() * 2 ** 31))
    save = { ...save, version: 6, grid, buildings, terrain }
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
