import {
  NOISE_BASE_FREQUENCY,
  NOISE_OCTAVES,
  NOISE_PERSISTENCE,
  RIVER_MAX_STEPS,
  RIVER_SOURCE_COUNT,
  SEA_LEVEL
} from './constants'
import { fractal_noise } from './noise'
import {
  MapData,
  create_map_data,
  cell_index,
  is_in_bounds,
  TERRAIN_CODE_PLAIN,
  TERRAIN_CODE_OCEAN,
  TERRAIN_CODE_RIVER
} from './map_data'
import { axial_neighbors } from './hex_grid'
import { create_rng } from './rng'

export const PROGRESS_HEIGHTMAP_END = 55
export const PROGRESS_CLASSIFY_END = 75
export const PROGRESS_RIVER_END = 95
export const PROGRESS_DONE = 100

export function build_heightmap(width: number, height: number, seed: number): Float32Array {
  const heights = new Float32Array(width * height)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) {
      const value = fractal_noise(q, r, seed, NOISE_OCTAVES, NOISE_BASE_FREQUENCY, NOISE_PERSISTENCE)
      heights[r * width + q] = value
      if (value < min) {
        min = value
      }
      if (value > max) {
        max = value
      }
    }
  }
  const span = max - min || 1
  for (let i = 0; i < heights.length; i++) {
    heights[i] = (heights[i] - min) / span
  }
  return heights
}

export function classify_terrain(heights: Float32Array): Uint8Array {
  const terrains = new Uint8Array(heights.length)
  for (let i = 0; i < heights.length; i++) {
    terrains[i] = heights[i] < SEA_LEVEL ? TERRAIN_CODE_OCEAN : TERRAIN_CODE_PLAIN
  }
  return terrains
}

export function carve_rivers(
  map: MapData,
  source_count: number = RIVER_SOURCE_COUNT,
  max_steps: number = RIVER_MAX_STEPS
): void {
  const rng = create_rng(map.seed ^ 0x5f356495)
  let placed = 0
  let attempts = 0
  while (placed < source_count && attempts < source_count * 8) {
    attempts++
    const q = Math.floor(rng() * map.width)
    const r = Math.floor(rng() * map.height)
    const index = cell_index(map, q, r)
    if (map.terrains[index] !== TERRAIN_CODE_PLAIN) {
      continue
    }
    if (map.heights[index] < SEA_LEVEL + 0.12) {
      continue
    }
    walk_river(map, q, r, max_steps)
    placed++
  }
}

function walk_river(map: MapData, start_q: number, start_r: number, max_steps: number): void {
  let q = start_q
  let r = start_r
  for (let step = 0; step < max_steps; step++) {
    const index = cell_index(map, q, r)
    if (map.terrains[index] === TERRAIN_CODE_OCEAN) {
      return
    }
    map.terrains[index] = TERRAIN_CODE_RIVER
    const next = lowest_neighbor(map, q, r)
    if (next === null) {
      return
    }
    q = next.q
    r = next.r
  }
}

function lowest_neighbor(map: MapData, q: number, r: number): { q: number; r: number } | null {
  let best: { q: number; r: number } | null = null
  let best_height = map.heights[cell_index(map, q, r)]
  for (const neighbor of axial_neighbors({ q, r })) {
    if (!is_in_bounds(map, neighbor.q, neighbor.r)) {
      continue
    }
    const height = map.heights[cell_index(map, neighbor.q, neighbor.r)]
    if (height < best_height) {
      best_height = height
      best = neighbor
    }
  }
  return best
}

export function generate_terrain(
  width: number,
  height: number,
  seed: number
): Generator<number, MapData, unknown> {
  return run_generation(width, height, seed)
}

function* run_generation(width: number, height: number, seed: number): Generator<number, MapData, unknown> {
  const map = create_map_data(width, height, seed)
  const heights = yield* build_heightmap_progressive(map)
  map.heights.set(heights)
  const terrains = classify_terrain(map.heights)
  map.terrains.set(terrains)
  yield PROGRESS_CLASSIFY_END
  carve_rivers(map)
  yield PROGRESS_RIVER_END
  yield PROGRESS_DONE
  return map
}

function* build_heightmap_progressive(map: MapData): Generator<number, Float32Array, unknown> {
  const heights = new Float32Array(map.width * map.height)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let r = 0; r < map.height; r++) {
    for (let q = 0; q < map.width; q++) {
      const value = fractal_noise(q, r, map.seed, NOISE_OCTAVES, NOISE_BASE_FREQUENCY, NOISE_PERSISTENCE)
      heights[r * map.width + q] = value
      if (value < min) {
        min = value
      }
      if (value > max) {
        max = value
      }
    }
    yield Math.floor(((r + 1) / map.height) * PROGRESS_HEIGHTMAP_END)
  }
  const span = max - min || 1
  for (let i = 0; i < heights.length; i++) {
    heights[i] = (heights[i] - min) / span
  }
  return heights
}
