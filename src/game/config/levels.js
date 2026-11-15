/** LEVEL_XP[n] = total XP needed to reach level n. */
export const LEVEL_XP = [
  0, 0, 15, 45, 100, 180, 300, 460, 680, 960, 1300,
  1750, 2300, 2950, 3700, 4550, 5500, 6600, 7800, 9150, 10600,
]
export const MAX_LEVEL = LEVEL_XP.length - 1

export const xpForLevel = (n) => LEVEL_XP[Math.min(Math.max(n, 1), MAX_LEVEL)]
export const orderSlotsFor = (lvl) => Math.min(3 + Math.floor(lvl / 2), 7)
export const levelUpCoins = (lvl) => 15 * lvl

/**
 * The map is a square GRID; you start with a startSize plot in the middle and each
 * expansion grows it by LAND_GROW tiles on every side (clamped to the map edge).
 */
export const LAND_EXPANSIONS = [
  { cost: 150, unlockLevel: 2 },
  { cost: 400, unlockLevel: 4 },
  { cost: 900, unlockLevel: 6 },
  { cost: 1800, unlockLevel: 9 },
  { cost: 3000, unlockLevel: 12 },
  { cost: 4500, unlockLevel: 15 },
]

export const GRID = { cols: 30, rows: 30, startSize: 13 }
export const LAND_GROW = 2
