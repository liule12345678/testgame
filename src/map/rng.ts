export function create_rng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 1664525) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hash_2d(x: number, y: number, seed: number): number {
  let h = (seed + Math.imul(x, 374761393) + Math.imul(y, 668265263)) >>> 0
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
