import { GRID, BUILDINGS, orderSlotsFor } from '../config/index.js'
import { generateOrder } from '../engine/orders.js'
import { centeredLand } from '../engine/grid.js'
import { makeRng } from '../engine/rng.js'

export const SAVE_VERSION = 4

/** Everyone starts with one of each booster so they can see what they do. */
export const STARTER_BOOSTERS = { tonic: 1, rush: 1, voucher: 1 }

/** Creates the runtime record for a building of `type` placed at (x, y). */
export function createBuilding(type, id, x, y, now) {
  const b = { id, type, x, y }
  if (type === 'field') Object.assign(b, { crop: null, plantedAt: 0, readyAt: 0 })
  if (BUILDINGS[type].category === 'factory') b.jobs = []
  if (BUILDINGS[type].rent) b.rentFrom = now
  if (BUILDINGS[type].animal) b.animals = Array.from({ length: BUILDINGS[type].startAnimals }, () => ({ fedAt: 0 }))
  return b
}

/** Positions relative to the starting plot's top corner. */
const STARTER_LAYOUT = [
  ['board', 4, 4],
  ['house', 1, 1],
  ['bakery', 5, 1],
  ['field', 1, 6], ['field', 2, 6], ['field', 3, 6],
  ['field', 1, 7], ['field', 2, 7], ['field', 3, 7],
  ['tree', 0, 4],
  ['tree', 8, 0],
  ['tree', 8, 8],
]

export function createInitialState(now, seed) {
  const rng = makeRng(seed)
  let nextId = 1
  const buildings = {}
  const land = centeredLand(GRID.cols, GRID.rows, GRID.startSize)
  for (const [type, x, y] of STARTER_LAYOUT) {
    const id = `b${nextId++}`
    buildings[id] = createBuilding(type, id, land.x0 + x, land.y0 + y, now)
  }

  const orders = []
  const ownedTypes = new Set(Object.values(buildings).map((b) => b.type))
  for (let i = 0; i < orderSlotsFor(1); i++) {
    orders.push(generateOrder({ level: 1, rng, id: `o${nextId++}`, now, ownedTypes, busy: orders.map((o) => o.client) }))
  }

  return {
    version: SAVE_VERSION,
    coins: 100,
    xp: 0,
    level: 1,
    inventory: { wheat: 3 },
    grid: { cols: GRID.cols, rows: GRID.rows, land },
    expansions: 0,
    buildings,
    orders,
    pendingLevelUps: [],
    reputation: {},
    boosters: { ...STARTER_BOOSTERS },
    pendingRepUps: [],
    stats: { ordersCompleted: 0, harvests: 0 },
    nextId,
    rngSeed: rng.seed(),
  }
}
