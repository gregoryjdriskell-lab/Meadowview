/**
 * Factory recipes. `building` must match a factory id in buildings.js.
 * A recipe's unlockLevel should be >= its building's unlockLevel.
 *
 * Optional:
 *   yield      how many items one batch makes (default 1)
 *   orderable  false keeps it out of town orders (e.g. animal feed)
 */
export const RECIPES = {
  // ── Bakery ──────────────────────────────────────────────
  bread: {
    id: 'bread', name: 'Bread', building: 'bakery', unlockLevel: 1,
    inputs: { wheat: 3 }, seconds: 30, xp: 4, value: 14,
  },
  cornbread: {
    id: 'cornbread', name: 'Cornbread', building: 'bakery', unlockLevel: 2,
    inputs: { corn: 2, wheat: 1 }, seconds: 60, xp: 6, value: 22,
  },
  carrotcake: {
    id: 'carrotcake', name: 'Carrot Cake', building: 'bakery', unlockLevel: 5,
    inputs: { carrot: 2, sugar: 1, wheat: 1 }, seconds: 120, xp: 12, value: 75,
  },
  pancakes: {
    id: 'pancakes', name: 'Pancakes', building: 'bakery', unlockLevel: 9,
    inputs: { egg: 2, milk: 1, wheat: 1 }, seconds: 75, xp: 9, value: 70,
  },

  // ── Snack Stand ─────────────────────────────────────────
  popcorn: {
    id: 'popcorn', name: 'Popcorn', building: 'snackstand', unlockLevel: 3,
    inputs: { corn: 2 }, seconds: 45, xp: 5, value: 18,
  },

  // ── Sugar Mill ──────────────────────────────────────────
  sugar: {
    id: 'sugar', name: 'Sugar', building: 'sugarmill', unlockLevel: 4,
    inputs: { sugarcane: 2 }, seconds: 60, xp: 6, value: 30,
  },
  jam: {
    id: 'jam', name: 'Berry Jam', building: 'sugarmill', unlockLevel: 6,
    inputs: { strawberry: 2, sugar: 1 }, seconds: 120, xp: 12, value: 72,
  },

  // ── Feed Mill (makes 3 per batch, never ordered) ────────
  poultryfeed: {
    id: 'poultryfeed', name: 'Poultry Feed', building: 'feedmill', unlockLevel: 7,
    inputs: { wheat: 2, corn: 1 }, seconds: 30, xp: 2, value: 8, yield: 3, orderable: false,
  },
  cowfeed: {
    id: 'cowfeed', name: 'Cow Feed', building: 'feedmill', unlockLevel: 8,
    inputs: { corn: 2, carrot: 1 }, seconds: 45, xp: 3, value: 12, yield: 3, orderable: false,
  },
  sheepfeed: {
    id: 'sheepfeed', name: 'Sheep Feed', building: 'feedmill', unlockLevel: 10,
    inputs: { wheat: 2, carrot: 2 }, seconds: 60, xp: 3, value: 14, yield: 3, orderable: false,
  },

  // ── Dairy ───────────────────────────────────────────────
  cream: {
    id: 'cream', name: 'Cream', building: 'dairy', unlockLevel: 8,
    inputs: { milk: 1 }, seconds: 45, xp: 4, value: 30,
  },
  cheese: {
    id: 'cheese', name: 'Cheese', building: 'dairy', unlockLevel: 9,
    inputs: { milk: 2 }, seconds: 90, xp: 7, value: 55,
  },
  butter: {
    id: 'butter', name: 'Butter', building: 'dairy', unlockLevel: 10,
    inputs: { cream: 2 }, seconds: 90, xp: 8, value: 80,
  },

  // ── Textile Factory ─────────────────────────────────────
  fabric: {
    id: 'fabric', name: 'Cotton Fabric', building: 'textile', unlockLevel: 9,
    inputs: { cotton: 3 }, seconds: 90, xp: 6, value: 55,
  },
  yarn: {
    id: 'yarn', name: 'Yarn', building: 'textile', unlockLevel: 10,
    inputs: { wool: 2 }, seconds: 90, xp: 7, value: 62,
  },

  // ── Tailor Shop ─────────────────────────────────────────
  tshirt: {
    id: 'tshirt', name: 'T-Shirt', building: 'tailor', unlockLevel: 11,
    inputs: { fabric: 2 }, seconds: 120, xp: 12, value: 140,
  },
  sweater: {
    id: 'sweater', name: 'Sweater', building: 'tailor', unlockLevel: 12,
    inputs: { yarn: 2, fabric: 1 }, seconds: 180, xp: 16, value: 210,
  },

  // ── Down Feather Factory ───────────────────────────────
  pillow: {
    id: 'pillow', name: 'Down Pillow', building: 'downmill', unlockLevel: 12,
    inputs: { feather: 3, fabric: 1 }, seconds: 150, xp: 14, value: 150,
  },
  quilt: {
    id: 'quilt', name: 'Cozy Quilt', building: 'downmill', unlockLevel: 14,
    inputs: { feather: 4, fabric: 2, yarn: 1 }, seconds: 240, xp: 22, value: 290,
  },

  // ── Florist ─────────────────────────────────────────────
  bouquet: {
    id: 'bouquet', name: 'Bouquet', building: 'florist', unlockLevel: 14,
    inputs: { tulip: 4, fabric: 1 }, seconds: 120, xp: 12, value: 125,
  },
  flowercrown: {
    id: 'flowercrown', name: 'Flower Crown', building: 'florist', unlockLevel: 15,
    inputs: { tulip: 3, yarn: 1 }, seconds: 150, xp: 14, value: 140,
  },
}
