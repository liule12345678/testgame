import { hash_2d } from './rng'

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

export function value_noise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = smooth(x - x0)
  const ty = smooth(y - y0)
  const v00 = hash_2d(x0, y0, seed)
  const v10 = hash_2d(x0 + 1, y0, seed)
  const v01 = hash_2d(x0, y0 + 1, seed)
  const v11 = hash_2d(x0 + 1, y0 + 1, seed)
  const a = v00 + (v10 - v00) * tx
  const b = v01 + (v11 - v01) * tx
  return a + (b - a) * ty
}

export function fractal_noise(
  x: number,
  y: number,
  seed: number,
  octaves: number,
  base_frequency: number,
  persistence: number
): number {
  let sum = 0
  let amplitude = 1
  let frequency = base_frequency
  let total = 0
  for (let i = 0; i < octaves; i++) {
    sum += value_noise(x * frequency, y * frequency, seed + i * 1013) * amplitude
    total += amplitude
    amplitude *= persistence
    frequency *= 2
  }
  return sum / total
}
