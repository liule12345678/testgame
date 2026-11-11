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

export interface terrain_params {
  sea_level: number
  river_source_count: number
  river_max_steps: number
  noise_octaves: number
  noise_base_frequency: number
  noise_persistence: number
}

export function default_terrain_params(): terrain_params {
  return {
    sea_level: SEA_LEVEL,
    river_source_count: RIVER_SOURCE_COUNT,
    river_max_steps: RIVER_MAX_STEPS,
    noise_octaves: NOISE_OCTAVES,
    noise_base_frequency: NOISE_BASE_FREQUENCY,
    noise_persistence: NOISE_PERSISTENCE
  }
}

export const PROGRESS_HEIGHTMAP_END = 55
export const PROGRESS_CLASSIFY_END = 75
export const PROGRESS_RIVER_END = 95
export const PROGRESS_DONE = 100

export function build_heightmap(
  width: number,
  height: number,
  seed: number,
  params: terrain_params = default_terrain_params()
): Float32Array {
  const heights = new Float32Array(width * height)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let r = 0; r < height; r++) {
    for (let q = 0; q < width; q++) {
      const value = fractal_noise(
        q,
        r,
        seed,
        params.noise_octaves,
        params.noise_base_frequency,
        params.noise_persistence
      )
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

export function classify_terrain(
  heights: Float32Array,
  sea_level: number = SEA_LEVEL
): Uint8Array {
  const terrains = new Uint8Array(heights.length)
  for (let i = 0; i < heights.length; i++) {
    terrains[i] = heights[i] < sea_level ? TERRAIN_CODE_OCEAN : TERRAIN_CODE_PLAIN
  }
  return terrains
}

export function carve_rivers(
  map: MapData,
  params: terrain_params = default_terrain_params()
): void {
  const rng = create_rng(map.seed ^ 0x5f356495)
  let placed = 0
  let attempts = 0
  while (placed < params.river_source_count && attempts < params.river_source_count * 8) {
    attempts++
    const q = Math.floor(rng() * map.width)
    const r = Math.floor(rng() * map.height)
    const index = cell_index(map, q, r)
    if (map.terrains[index] !== TERRAIN_CODE_PLAIN) {
      continue
    }
    if (map.heights[index] < params.sea_level + 0.12) {
      continue
    }
    walk_river(map, q, r, params.river_max_steps)
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
  seed: number,
  params: terrain_params = default_terrain_params()
): Generator<number, MapData, unknown> {
  return run_generation(width, height, seed, params)
}

function* run_generation(
  width: number,
  height: number,
  seed: number,
  params: terrain_params
): Generator<number, MapData, unknown> {
  const map = create_map_data(width, height, seed)
  const heights = yield* build_heightmap_progressive(map, params)
  map.heights.set(heights)
  const terrains = classify_terrain(map.heights, params.sea_level)
  map.terrains.set(terrains)
  yield PROGRESS_CLASSIFY_END
  carve_rivers(map, params)
  yield PROGRESS_RIVER_END
  yield PROGRESS_DONE
  return map
}

function* build_heightmap_progressive(
  map: MapData,
  params: terrain_params
): Generator<number, Float32Array, unknown> {
  const heights = new Float32Array(map.width * map.height)
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (let r = 0; r < map.height; r++) {
    for (let q = 0; q < map.width; q++) {
      const value = fractal_noise(
        q,
        r,
        map.seed,
        params.noise_octaves,
        params.noise_base_frequency,
        params.noise_persistence
      )
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
