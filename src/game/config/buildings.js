/**
 * Everything that can sit on the town grid.
 *
 * size        [width, height] in tiles
 * cost        coins for the first one; each extra copy costs `costGrowth` more
 * maxCount    (level) => how many the player may own at that level
 * buyable     false for special buildings that only come pre-placed
 */
export const BUILDING_CATEGORIES = [
  { id: 'farming', name: 'Farming' },
  { id: 'factory', name: 'Factories' },
  { id: 'housing', name: 'Homes' },
  { id: 'decor', name: 'Decor' },
]

export const BUILDINGS = {
  field: {
    id: 'field', name: 'Field', category: 'farming', size: [1, 1],
    cost: 10, costGrowth: 5, unlockLevel: 1, xp: 1,
    maxCount: (lvl) => Math.min(6 + 2 * (lvl - 1), 24),
    description: 'Plant crops, wait, then harvest.',
  },
  bakery: {
    id: 'bakery', name: 'Bakery', category: 'factory', size: [2, 2],
    cost: 80, unlockLevel: 1, xp: 10, maxCount: () => 1, queueSlots: 3,
    description: 'Bakes bread and treats.',
  },
  snackstand: {
    id: 'snackstand', name: 'Snack Stand', category: 'factory', size: [2, 2],
    cost: 250, unlockLevel: 3, xp: 15, maxCount: () => 1, queueSlots: 3,
    description: 'Pops fresh popcorn.',
  },
  sugarmill: {
    id: 'sugarmill', name: 'Sugar Mill', category: 'factory', size: [2, 2],
    cost: 450, unlockLevel: 4, xp: 20, maxCount: () => 1, queueSlots: 3,
    description: 'Sugar, and later, jam.',
  },
  house: {
    id: 'house', name: 'Cozy Cottage', category: 'housing', size: [2, 2],
    cost: 60, costGrowth: 30, unlockLevel: 1, xp: 5,
    maxCount: (lvl) => 2 + lvl,
    rent: { coins: 6, everySeconds: 60, maxPeriods: 5 },
    description: 'Neighbours pay a little rent.',
  },
  gardenhouse: {
    id: 'gardenhouse', name: 'Garden House', category: 'housing', size: [2, 2],
    cost: 220, costGrowth: 60, unlockLevel: 4, xp: 12,
    maxCount: (lvl) => Math.max(0, lvl - 2),
    rent: { coins: 18, everySeconds: 90, maxPeriods: 5 },
    description: 'Roomier home, better rent.',
  },
  tree: {
    id: 'tree', name: 'Round Tree', category: 'decor', size: [1, 1],
    cost: 15, unlockLevel: 1, xp: 1, maxCount: () => 30,
    description: 'Shade and good vibes.',
  },
  flowers: {
    id: 'flowers', name: 'Flower Bed', category: 'decor', size: [1, 1],
    cost: 25, unlockLevel: 2, xp: 2, maxCount: () => 30,
    description: 'A splash of color.',
  },
  board: {
    id: 'board', name: 'Order Board', category: 'special', size: [2, 1],
    cost: 0, unlockLevel: 1, xp: 0, maxCount: () => 1, buyable: false,
    description: 'Townsfolk pin their requests here.',
  },
}

export const isFactory = (type) => BUILDINGS[type]?.category === 'factory'
export const isHousing = (type) => Boolean(BUILDINGS[type]?.rent)

/** Price of the next copy of a building, given how many the player owns. */
export const costFor = (type, owned) => {
  const def = BUILDINGS[type]
  return def.cost + (def.costGrowth ?? 0) * owned
}
