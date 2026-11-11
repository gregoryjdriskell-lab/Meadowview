import { CROPS } from './crops.js'
import { RECIPES } from './recipes.js'
import { ANIMALS } from './animals.js'

export * from './crops.js'
export * from './recipes.js'
export * from './animals.js'
export * from './buildings.js'
export * from './levels.js'
export * from './townsfolk.js'

/**
 * Every inventory item with a shared shape.
 * category: 'crop' | 'animal' (raw animal goods) | 'feed' | 'product'
 */
export const ITEMS = {
  ...Object.fromEntries(
    Object.values(CROPS).map((c) => [c.id, { id: c.id, name: c.name, category: 'crop', value: c.value, xp: c.xp, unlockLevel: c.unlockLevel, orderable: true }]),
  ),
  ...Object.fromEntries(
    Object.values(ANIMALS).map((a) => [
      a.product.id,
      { id: a.product.id, name: a.product.name, category: 'animal', value: a.product.value, xp: a.product.xp, unlockLevel: a.unlockLevel, orderable: true, source: a.id },
    ]),
  ),
  ...Object.fromEntries(
    Object.values(RECIPES).map((r) => [
      r.id,
      {
        id: r.id, name: r.name, category: r.orderable === false ? 'feed' : 'product',
        value: r.value, xp: r.xp, unlockLevel: r.unlockLevel, orderable: r.orderable !== false,
      },
    ]),
  ),
}
