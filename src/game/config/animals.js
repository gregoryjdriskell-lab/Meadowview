/**
 * Animals live in pens (see buildings.js, category 'animals').
 * Each animal eats one `feed` item, then produces one `product` after `seconds`.
 * Products are raw goods for factories (and can be ordered directly).
 */
export const ANIMALS = {
  chicken: {
    id: 'chicken', name: 'Chicken', unlockLevel: 7, feed: 'poultryfeed', seconds: 60,
    product: { id: 'egg', name: 'Egg', xp: 2, value: 12 },
  },
  cow: {
    id: 'cow', name: 'Cow', unlockLevel: 8, feed: 'cowfeed', seconds: 120,
    product: { id: 'milk', name: 'Milk', xp: 3, value: 18 },
  },
  sheep: {
    id: 'sheep', name: 'Sheep', unlockLevel: 10, feed: 'sheepfeed', seconds: 180,
    product: { id: 'wool', name: 'Wool', xp: 4, value: 24 },
  },
  duck: {
    id: 'duck', name: 'Duck', unlockLevel: 12, feed: 'poultryfeed', seconds: 150,
    product: { id: 'feather', name: 'Down Feather', xp: 4, value: 22 },
  },
}
