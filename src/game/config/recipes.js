/**
 * Factory recipes. `building` must match a factory id in buildings.js.
 * A recipe's unlockLevel should be >= its building's unlockLevel.
 */
export const RECIPES = {
  bread: {
    id: 'bread', name: 'Bread', building: 'bakery', unlockLevel: 1,
    inputs: { wheat: 3 }, seconds: 30, xp: 4, value: 14,
  },
  cornbread: {
    id: 'cornbread', name: 'Cornbread', building: 'bakery', unlockLevel: 2,
    inputs: { corn: 2, wheat: 1 }, seconds: 60, xp: 6, value: 22,
  },
  popcorn: {
    id: 'popcorn', name: 'Popcorn', building: 'snackstand', unlockLevel: 3,
    inputs: { corn: 2 }, seconds: 45, xp: 5, value: 18,
  },
  sugar: {
    id: 'sugar', name: 'Sugar', building: 'sugarmill', unlockLevel: 4,
    inputs: { sugarcane: 2 }, seconds: 60, xp: 6, value: 30,
  },
  carrotcake: {
    id: 'carrotcake', name: 'Carrot Cake', building: 'bakery', unlockLevel: 5,
    inputs: { carrot: 2, sugar: 1, wheat: 1 }, seconds: 120, xp: 12, value: 75,
  },
  jam: {
    id: 'jam', name: 'Berry Jam', building: 'sugarmill', unlockLevel: 6,
    inputs: { strawberry: 2, sugar: 1 }, seconds: 120, xp: 12, value: 72,
  },
}
