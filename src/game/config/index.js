import { CROPS } from './crops.js'
import { RECIPES } from './recipes.js'

export * from './crops.js'
export * from './recipes.js'
export * from './buildings.js'
export * from './levels.js'
export * from './townsfolk.js'

/** Every inventory item (crops + products) with a shared shape. */
export const ITEMS = {
  ...Object.fromEntries(
    Object.values(CROPS).map((c) => [c.id, { id: c.id, name: c.name, category: 'crop', value: c.value, xp: c.xp, unlockLevel: c.unlockLevel }]),
  ),
  ...Object.fromEntries(
    Object.values(RECIPES).map((r) => [r.id, { id: r.id, name: r.name, category: 'product', value: r.value, xp: r.xp, unlockLevel: r.unlockLevel }]),
  ),
}
