/** Small seeded PRNG (mulberry32) so the reducer stays pure and testable. */
export function makeRng(seed) {
  let a = seed >>> 0
  const rng = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  rng.seed = () => a
  rng.int = (n) => Math.floor(rng() * n)
  return rng
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32)
