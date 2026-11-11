/**
 * The canonical list of sprite ids the game asks for. Plain JS (no JSX) so the
 * Node tooling in scripts/sprites.mjs can import it too.
 *
 *   building.<id>        e.g. building.bakery   (box = footprint * 100)
 *   item.<id>            e.g. item.bread        (100x100)
 *   crop.<id>.<stage>    e.g. crop.wheat.2      (stage 0 sprout, 1 growing, 2 ripe; drawn over the field)
 *   animal.<id>          e.g. animal.cow        (100x100, drawn inside pens)
 *   avatar.<n>           townsfolk portraits
 *   ui.<name>            coin, xp, land
 */
import { ANIMALS, BUILDINGS, CROPS, ITEMS, AVATAR_COUNT } from '../game/config/index.js'

export const CROP_STAGES = 3
export const UI_SPRITES = ['coin', 'xp', 'land']

export function allSpriteKeys() {
  return [
    ...Object.keys(BUILDINGS).map((id) => `building.${id}`),
    ...Object.keys(ITEMS).map((id) => `item.${id}`),
    ...Object.keys(CROPS).flatMap((id) => Array.from({ length: CROP_STAGES }, (_, s) => `crop.${id}.${s}`)),
    ...Object.keys(ANIMALS).map((id) => `animal.${id}`),
    ...Array.from({ length: AVATAR_COUNT }, (_, i) => `avatar.${i}`),
    ...UI_SPRITES.map((n) => `ui.${n}`),
  ]
}

/** Natural aspect box for a sprite id, in "art units" (100 per tile). */
export function spriteBox(id) {
  const [ns, name] = id.split('.')
  if (ns === 'building' && BUILDINGS[name]) {
    const [w, h] = BUILDINGS[name].size
    return { width: w * 100, height: h * 100 }
  }
  return { width: 100, height: 100 }
}
