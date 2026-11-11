/**
 * Everything that can sit on the town grid.
 *
 * size        [width, height] in tiles
 * cost        coins for the first one; each extra copy costs `costGrowth` more
 * maxCount    (level) => how many the player may own at that level
 * buyable     false for special buildings that only come pre-placed
 *
 * Animal pens (category 'animals') also have:
 * animal        id from animals.js
 * startAnimals  animals included with the pen
 * maxAnimals    pen capacity
 * animalCost    coins for the next animal; each extra costs `animalCostGrowth` more
 */
export const BUILDING_CATEGORIES = [
  { id: 'farming', name: 'Farming' },
  { id: 'animals', name: 'Animals' },
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
  feedmill: {
    id: 'feedmill', name: 'Feed Mill', category: 'factory', size: [2, 2],
    cost: 600, unlockLevel: 7, xp: 20, maxCount: () => 1, queueSlots: 4,
    description: 'Turns grain into animal feed.',
  },
  dairy: {
    id: 'dairy', name: 'Dairy', category: 'factory', size: [2, 2],
    cost: 900, unlockLevel: 8, xp: 25, maxCount: () => 1, queueSlots: 3,
    description: 'Cream, cheese and butter.',
  },
  textile: {
    id: 'textile', name: 'Textile Factory', category: 'factory', size: [2, 2],
    cost: 1200, unlockLevel: 9, xp: 30, maxCount: () => 1, queueSlots: 3,
    description: 'Spins fabric and yarn.',
  },
  tailor: {
    id: 'tailor', name: 'Tailor Shop', category: 'factory', size: [2, 2],
    cost: 1600, unlockLevel: 11, xp: 35, maxCount: () => 1, queueSlots: 3,
    description: 'Sews clothes from fabric and yarn.',
  },
  downmill: {
    id: 'downmill', name: 'Down Feather Factory', category: 'factory', size: [2, 2],
    cost: 2000, unlockLevel: 12, xp: 40, maxCount: () => 1, queueSlots: 3,
    description: 'Fluffy pillows and quilts.',
  },
  florist: {
    id: 'florist', name: 'Florist', category: 'factory', size: [2, 2],
    cost: 2400, unlockLevel: 14, xp: 45, maxCount: () => 1, queueSlots: 3,
    description: 'Bouquets and flower crowns.',
  },
  coop: {
    id: 'coop', name: 'Chicken Coop', category: 'animals', size: [2, 2],
    cost: 400, unlockLevel: 7, xp: 15, maxCount: (lvl) => (lvl >= 15 ? 2 : 1),
    animal: 'chicken', startAnimals: 2, maxAnimals: 5, animalCost: 40, animalCostGrowth: 20,
    description: 'Hens lay eggs when fed.',
  },
  pasture: {
    id: 'pasture', name: 'Cow Pasture', category: 'animals', size: [2, 2],
    cost: 700, unlockLevel: 8, xp: 20, maxCount: (lvl) => (lvl >= 16 ? 2 : 1),
    animal: 'cow', startAnimals: 2, maxAnimals: 5, animalCost: 70, animalCostGrowth: 30,
    description: 'Cows give milk when fed.',
  },
  sheepfold: {
    id: 'sheepfold', name: 'Sheep Meadow', category: 'animals', size: [2, 2],
    cost: 1000, unlockLevel: 10, xp: 25, maxCount: (lvl) => (lvl >= 17 ? 2 : 1),
    animal: 'sheep', startAnimals: 2, maxAnimals: 5, animalCost: 100, animalCostGrowth: 40,
    description: 'Sheep grow wool when fed.',
  },
  duckpond: {
    id: 'duckpond', name: 'Duck Pond', category: 'animals', size: [2, 2],
    cost: 1400, unlockLevel: 12, xp: 30, maxCount: (lvl) => (lvl >= 18 ? 2 : 1),
    animal: 'duck', startAnimals: 2, maxAnimals: 5, animalCost: 120, animalCostGrowth: 50,
    description: 'Ducks shed soft down feathers.',
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
export const isPen = (type) => BUILDINGS[type]?.category === 'animals'

/** Price of the next copy of a building, given how many the player owns. */
export const costFor = (type, owned) => {
  const def = BUILDINGS[type]
  return def.cost + (def.costGrowth ?? 0) * owned
}

/** Price of the next animal for a pen that currently holds `count` animals. */
export const animalCostFor = (type, count) => {
  const def = BUILDINGS[type]
  return def.animalCost + (def.animalCostGrowth ?? 0) * (count - def.startAnimals)
}
