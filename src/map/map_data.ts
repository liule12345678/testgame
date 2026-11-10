import { CHUNK_SIZE } from './constants'
import { TerrainType, TERRAIN_PLAIN, TERRAIN_OCEAN, TERRAIN_RIVER } from './terrain_type'

export const TERRAIN_CODE_PLAIN = 0
export const TERRAIN_CODE_OCEAN = 1
export const TERRAIN_CODE_RIVER = 2

const TERRAIN_CODE_TABLE: TerrainType[] = [TERRAIN_PLAIN, TERRAIN_OCEAN, TERRAIN_RIVER]

export function terrain_code_to_type(code: number): TerrainType {
  return TERRAIN_CODE_TABLE[code]
}

export interface MapData {
  width: number
  height: number
  seed: number
  chunk_size: number
  heights: Float32Array
  terrains: Uint8Array
  chunk_cols: number
  chunk_rows: number
}

export function create_map_data(width: number, height: number, seed: number): MapData {
  return {
    width,
    height,
    seed,
    chunk_size: CHUNK_SIZE,
    heights: new Float32Array(width * height),
    terrains: new Uint8Array(width * height),
    chunk_cols: Math.ceil(width / CHUNK_SIZE),
    chunk_rows: Math.ceil(height / CHUNK_SIZE)
  }
}

export function cell_index(map: MapData, q: number, r: number): number {
  return r * map.width + q
}

export function is_in_bounds(map: MapData, q: number, r: number): boolean {
  return q >= 0 && r >= 0 && q < map.width && r < map.height
}

export function height_at(map: MapData, q: number, r: number): number {
  return map.heights[cell_index(map, q, r)]
}

export function terrain_at(map: MapData, q: number, r: number): TerrainType {
  return terrain_code_to_type(map.terrains[cell_index(map, q, r)])
}

export function count_terrain(map: MapData, target: TerrainType): number {
  let total = 0
  for (let i = 0; i < map.terrains.length; i++) {
    if (terrain_code_to_type(map.terrains[i]) === target) {
      total++
    }
  }
  return total
}
