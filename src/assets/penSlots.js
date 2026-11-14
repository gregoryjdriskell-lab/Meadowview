/**
 * Where animals stand inside a 2x2 pen, as fractions of the pen's square sprite box
 * (x = center, y = feet). Derived from isometric grid points inside the fence.
 */
const S = 400
const P = (gx, gy) => [((gx - gy) * 100 + 200) / S, ((gx + gy) * 50 + 200) / S]

const sortBack = (list) => list.sort((a, b) => a[0] + a[1] - (b[0] + b[1])).map(([gx, gy]) => P(gx, gy))

export const YARD_SLOTS = sortBack([[1.45, 0.5], [0.5, 1.4], [1.15, 1.1], [1.65, 1.35], [1.25, 1.7]])
export const POND_SLOTS = sortBack([[1.25, 0.85], [0.85, 1.25], [1.3, 1.35], [1.62, 1.1], [1.05, 1.62]])

export const penSlots = (type) => (type === 'duckpond' ? POND_SLOTS : YARD_SLOTS)
/** Animal sprite width as a fraction of the pen box. */
export const ANIMAL_SIZE = 0.24
