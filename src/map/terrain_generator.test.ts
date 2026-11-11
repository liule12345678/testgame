import { describe, expect, it } from 'vitest'
import {
  generate_terrain,
  classify_terrain,
  carve_rivers,
  default_terrain_params,
  PROGRESS_DONE
} from './terrain_generator'
import type { terrain_params } from './terrain_generator'
import {
  create_map_data,
  cell_index,
  TERRAIN_CODE_PLAIN,
  TERRAIN_CODE_OCEAN,
  TERRAIN_CODE_RIVER
} from './map_data'

const test_params: terrain_params = {
  ...default_terrain_params(),
  river_source_count: 6,
  river_max_steps: 48
}

describe('terrain_generator', () => {
  it('generate_terrain 产出 MapData 且进度递增至 100', () => {
    const generator = generate_terrain(16, 16, 7, test_params)
    const progress: number[] = []
    let step = generator.next()
    while (!step.done) {
      progress.push(step.value)
      step = generator.next()
    }
    const map = step.value
    expect(map.width).toBe(16)
    expect(map.height).toBe(16)
    expect(map.seed).toBe(7)
    expect(map.heights.length).toBe(256)
    expect(map.terrains.length).toBe(256)
    expect(progress.length).toBeGreaterThan(0)
    expect(progress[progress.length - 1]).toBe(PROGRESS_DONE)
    for (let i = 1; i < progress.length; i++) {
      expect(progress[i]).toBeGreaterThanOrEqual(progress[i - 1])
      expect(progress[i]).toBeLessThanOrEqual(PROGRESS_DONE)
    }
    for (let i = 0; i < map.terrains.length; i++) {
      expect([
        TERRAIN_CODE_PLAIN,
        TERRAIN_CODE_OCEAN,
        TERRAIN_CODE_RIVER
      ]).toContain(map.terrains[i])
    }
  })

  it('classify_terrain 海平面阈值判定', () => {
    const heights = Float32Array.from([0, 0.41, 0.43, 0.5, 1])
    const terrains = classify_terrain(heights, 0.42)
    expect(terrains[0]).toBe(TERRAIN_CODE_OCEAN)
    expect(terrains[1]).toBe(TERRAIN_CODE_OCEAN)
    expect(terrains[2]).toBe(TERRAIN_CODE_PLAIN)
    expect(terrains[3]).toBe(TERRAIN_CODE_PLAIN)
    expect(terrains[4]).toBe(TERRAIN_CODE_PLAIN)
    const edge = classify_terrain(Float32Array.from([0.5, 0.5]), 0.5)
    expect(edge[0]).toBe(TERRAIN_CODE_PLAIN)
    expect(edge[1]).toBe(TERRAIN_CODE_PLAIN)
  })

  it('carve_rivers 河流不落海洋', () => {
    const map = create_map_data(24, 24, 99)
    for (let r = 0; r < 24; r++) {
      for (let q = 0; q < 24; q++) {
        map.heights[cell_index(map, q, r)] = (q + r) * 0.01
        map.terrains[cell_index(map, q, r)] = TERRAIN_CODE_PLAIN
      }
    }
    map.heights[cell_index(map, 0, 0)] = 0
    map.terrains[cell_index(map, 0, 0)] = TERRAIN_CODE_OCEAN
    const params: terrain_params = {
      ...test_params,
      sea_level: 0
    }
    carve_rivers(map, params)
    expect(map.terrains[cell_index(map, 0, 0)]).toBe(TERRAIN_CODE_OCEAN)
    let river_count = 0
    for (let i = 0; i < map.terrains.length; i++) {
      if (map.terrains[i] === TERRAIN_CODE_RIVER) {
        river_count++
      }
    }
    expect(river_count).toBeGreaterThan(0)
    expect(map.terrains.length).toBe(576)
  })
})
