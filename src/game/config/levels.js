/** LEVEL_XP[n] = total XP needed to reach level n. */
export const LEVEL_XP = [
  0, 0, 15, 45, 100, 180, 300, 460, 680, 960, 1300,
  1750, 2300, 2950, 3700, 4550, 5500, 6600, 7800, 9150, 10600,
]
export const MAX_LEVEL = LEVEL_XP.length - 1

export const xpForLevel = (n) => LEVEL_XP[Math.min(Math.max(n, 1), MAX_LEVEL)]
export const orderSlotsFor = (lvl) => Math.min(3 + Math.floor(lvl / 2), 7)
export const levelUpCoins = (lvl) => 15 * lvl

/** Land is unlocked in strips of rows, in order. */
export const LAND_EXPANSIONS = [
  { rows: 2, cost: 150, unlockLevel: 2 },
  { rows: 2, cost: 400, unlockLevel: 4 },
  { rows: 2, cost: 900, unlockLevel: 6 },
  { rows: 2, cost: 1800, unlockLevel: 9 },
  { rows: 2, cost: 3000, unlockLevel: 12 },
  { rows: 2, cost: 4500, unlockLevel: 15 },
]

export const GRID = { cols: 10, rows: 20, startRows: 8 }
