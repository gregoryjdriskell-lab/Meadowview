/** LEVEL_XP[n] = total XP needed to reach level n. */
export const LEVEL_XP = [0, 0, 15, 45, 100, 180, 300, 460, 680, 960, 1300]
export const MAX_LEVEL = LEVEL_XP.length - 1

export const xpForLevel = (n) => LEVEL_XP[Math.min(Math.max(n, 1), MAX_LEVEL)]
export const orderSlotsFor = (lvl) => Math.min(3 + Math.floor(lvl / 2), 7)
export const levelUpCoins = (lvl) => 15 * lvl

/** Land is unlocked in strips of rows, in order. */
export const LAND_EXPANSIONS = [
  { rows: 2, cost: 150, unlockLevel: 2 },
  { rows: 2, cost: 400, unlockLevel: 4 },
  { rows: 2, cost: 900, unlockLevel: 6 },
]

export const GRID = { cols: 10, rows: 14, startRows: 8 }
