/**
 * Crops grown on Fields.
 *
 * `art` drives the procedural vector sprites (see src/assets/vector/crops.jsx):
 *   kind  - plant silhouette: grain | cob | root | cane | berry | boll | flower
 *   stem  - leaf / stalk color
 *   fruit - color of the harvestable part when ripe
 */
export const CROPS = {
  wheat: {
    id: 'wheat', name: 'Wheat', unlockLevel: 1,
    growSeconds: 20, seedCost: 0, yield: 2, xp: 1, value: 3,
    art: { kind: 'grain', stem: '#8fc46a', fruit: '#f2c94c' },
  },
  corn: {
    id: 'corn', name: 'Corn', unlockLevel: 2,
    growSeconds: 45, seedCost: 2, yield: 2, xp: 2, value: 6,
    art: { kind: 'cob', stem: '#6fb75e', fruit: '#ffd85e' },
  },
  carrot: {
    id: 'carrot', name: 'Carrot', unlockLevel: 3,
    growSeconds: 90, seedCost: 3, yield: 2, xp: 3, value: 9,
    art: { kind: 'root', stem: '#6fbf5a', fruit: '#ff9a52' },
  },
  sugarcane: {
    id: 'sugarcane', name: 'Sugarcane', unlockLevel: 4,
    growSeconds: 150, seedCost: 4, yield: 2, xp: 4, value: 12,
    art: { kind: 'cane', stem: '#7cc45f', fruit: '#c6e27f' },
  },
  strawberry: {
    id: 'strawberry', name: 'Strawberry', unlockLevel: 6,
    growSeconds: 240, seedCost: 6, yield: 3, xp: 6, value: 16,
    art: { kind: 'berry', stem: '#5fae5f', fruit: '#ff6b81' },
  },
  cotton: {
    id: 'cotton', name: 'Cotton', unlockLevel: 9,
    growSeconds: 180, seedCost: 5, yield: 2, xp: 5, value: 14,
    art: { kind: 'boll', stem: '#6aa85c', fruit: '#ffffff' },
  },
  tulip: {
    id: 'tulip', name: 'Tulip', unlockLevel: 13,
    growSeconds: 200, seedCost: 6, yield: 3, xp: 5, value: 15,
    art: { kind: 'flower', stem: '#6fbf5a', fruit: '#ff7eb3' },
  },
}
