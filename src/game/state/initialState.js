import { GRID, BUILDINGS, orderSlotsFor } from '../config/index.js'
import { generateOrder } from '../engine/orders.js'
import { makeRng } from '../engine/rng.js'

export const SAVE_VERSION = 1

/** Creates the runtime record for a building of `type` placed at (x, y). */
export function createBuilding(type, id, x, y, now) {
  const b = { id, type, x, y }
  if (type === 'field') Object.assign(b, { crop: null, plantedAt: 0, readyAt: 0 })
  if (BUILDINGS[type].category === 'factory') b.jobs = []
  if (BUILDINGS[type].rent) b.rentFrom = now
  return b
}

const STARTER_LAYOUT = [
  ['house', 0, 0],
  ['board', 3, 1],
  ['bakery', 7, 0],
  ['field', 1, 4], ['field', 2, 4], ['field', 3, 4],
  ['field', 1, 5], ['field', 2, 5], ['field', 3, 5],
  ['tree', 0, 7],
  ['tree', 9, 7],
  ['tree', 6, 3],
]

export function createInitialState(now, seed) {
  const rng = makeRng(seed)
  let nextId = 1
  const buildings = {}
  for (const [type, x, y] of STARTER_LAYOUT) {
    const id = `b${nextId++}`
    buildings[id] = createBuilding(type, id, x, y, now)
  }

  const orders = []
  for (let i = 0; i < orderSlotsFor(1); i++) {
    orders.push(generateOrder({ level: 1, rng, id: `o${nextId++}`, now }))
  }

  return {
    version: SAVE_VERSION,
    coins: 100,
    xp: 0,
    level: 1,
    inventory: { wheat: 3 },
    grid: { cols: GRID.cols, rows: GRID.rows, unlockedRows: GRID.startRows },
    expansions: 0,
    buildings,
    orders,
    pendingLevelUps: [],
    stats: { ordersCompleted: 0, harvests: 0 },
    nextId,
    rngSeed: rng.seed(),
  }
}
