import { hash_2d } from './rng'

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

function wrap_positive(value: number, period: number): number {
  return ((value % period) + period) % period
}

export function value_noise(x: number, y: number, seed: number, period_x: number = 0): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const tx = smooth(x - x0)
  const ty = smooth(y - y0)
  const xa = period_x > 0 ? wrap_positive(x0, period_x) : x0
  const xb = period_x > 0 ? wrap_positive(x0 + 1, period_x) : x0 + 1
  const v00 = hash_2d(xa, y0, seed)
  const v10 = hash_2d(xb, y0, seed)
  const v01 = hash_2d(xa, y0 + 1, seed)
  const v11 = hash_2d(xb, y0 + 1, seed)
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
  persistence: number,
  period_x: number = 0
): number {
  let sum = 0
  let amplitude = 1
  let frequency = base_frequency
  let total = 0
  for (let i = 0; i < octaves; i++) {
    let sx = x * frequency
    let cells = 0
    if (period_x > 0) {
      cells = Math.max(1, Math.round(period_x * frequency))
      sx = (x / period_x) * cells
    }
    sum += value_noise(sx, y * frequency, seed + i * 1013, cells) * amplitude
    total += amplitude
    amplitude *= persistence
    frequency *= 2
  }
  return sum / total
}
