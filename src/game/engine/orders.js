import { ITEMS, TOWNSFOLK, BUILDINGS, RECIPES } from '../config/index.js'

/** Items that can appear in orders at a given level. */
export function orderableItems(level) {
  return Object.values(ITEMS).filter((item) => {
    if (item.unlockLevel > level) return false
    if (item.category === 'product') return BUILDINGS[RECIPES[item.id].building].unlockLevel <= level
    return true
  })
}

/**
 * Builds a new town order. Pure given `rng`.
 * Rewards are a premium over the raw item value so orders are always worth filling.
 */
export function generateOrder({ level, rng, id, now, delayMs = 0 }) {
  const pool = orderableItems(level)
  const maxKinds = level < 2 ? 1 : level < 4 ? 2 : 3
  const kinds = Math.min(pool.length, 1 + rng.int(maxKinds))

  // Bias towards the newest unlocks so fresh content shows up quickly.
  const weighted = pool.flatMap((item) => Array(item.unlockLevel === level ? 2 : 1).fill(item))
  const picked = []
  while (picked.length < kinds) {
    const item = weighted[rng.int(weighted.length)]
    if (!picked.includes(item)) picked.push(item)
  }

  const items = picked.map((item) => ({
    id: item.id,
    qty: item.category === 'crop'
      ? 2 + rng.int(Math.min(2 + Math.floor(level / 2), 6))
      : 1 + rng.int(level < 4 ? 2 : 3),
  }))

  const baseValue = items.reduce((sum, { id, qty }) => sum + ITEMS[id].value * qty, 0)
  const baseXp = items.reduce((sum, { id, qty }) => sum + ITEMS[id].xp * qty, 0)

  return {
    id,
    requester: rng.int(TOWNSFOLK.length),
    items,
    coins: Math.round(baseValue * (1.2 + rng() * 0.3)),
    xp: Math.round(baseXp * 1.5) + 2,
    availableAt: now + delayMs,
  }
}
