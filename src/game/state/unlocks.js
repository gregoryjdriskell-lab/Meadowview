import { BUILDINGS, CROPS, RECIPES, LAND_EXPANSIONS } from '../config/index.js'

/** Everything that becomes available at exactly `level`, as sprite-ready entries. */
export function unlocksAtLevel(level) {
  return [
    ...Object.values(CROPS).filter((c) => c.unlockLevel === level).map((c) => ({ key: `item.${c.id}`, name: c.name, kind: 'Crop' })),
    ...Object.values(RECIPES).filter((r) => r.unlockLevel === level).map((r) => ({ key: `item.${r.id}`, name: r.name, kind: 'Recipe' })),
    ...Object.values(BUILDINGS)
      .filter((b) => b.buyable !== false && b.unlockLevel === level)
      .map((b) => ({ key: `building.${b.id}`, name: b.name, kind: 'Building' })),
    ...LAND_EXPANSIONS.filter((e) => e.unlockLevel === level).map(() => ({ key: 'ui.land', name: 'Land expansion', kind: 'Land' })),
  ]
}
