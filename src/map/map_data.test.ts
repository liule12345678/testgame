import { describe, expect, it } from 'vitest'
import {
  create_map_data,
  cell_index,
  is_in_bounds,
  wrap_cell,
  terrain_code_to_type,
  TERRAIN_CODE_PLAIN,
  TERRAIN_CODE_OCEAN,
  TERRAIN_CODE_RIVER
} from './map_data'
import { CHUNK_SIZE } from './constants'
import { TERRAIN_PLAIN, TERRAIN_OCEAN, TERRAIN_RIVER } from './terrain_type'

describe('map_data', () => {
  it('create_map_data 生成 512 尺寸与 128 分块', () => {
    const map = create_map_data(512, 512, 42)
    expect(map.width).toBe(512)
    expect(map.height).toBe(512)
    expect(map.seed).toBe(42)
    expect(map.chunk_size).toBe(CHUNK_SIZE)
    expect(map.chunk_cols).toBe(128)
    expect(map.chunk_rows).toBe(128)
    expect(map.heights.length).toBe(512 * 512)
    expect(map.terrains.length).toBe(512 * 512)
  })

  it('create_map_data 非整除尺寸向上取整分块', () => {
    const map = create_map_data(10, 6, 1)
    expect(map.chunk_cols).toBe(3)
    expect(map.chunk_rows).toBe(2)
    expect(map.heights.length).toBe(60)
    expect(map.terrains.length).toBe(60)
  })

  it('cell_index 按行优先定位', () => {
    const map = create_map_data(8, 8, 1)
    expect(cell_index(map, 0, 0)).toBe(0)
    expect(cell_index(map, 3, 2)).toBe(19)
    expect(cell_index(map, 7, 7)).toBe(63)
  })

  it('cell_index 横向环绕寻址', () => {
    const map = create_map_data(8, 8, 1)
    expect(cell_index(map, -1, 0)).toBe(7)
    expect(cell_index(map, 8, 3)).toBe(cell_index(map, 0, 3))
    expect(cell_index(map, 17, 2)).toBe(cell_index(map, 1, 2))
  })

  it('wrap_cell 横向取模纵向不变', () => {
    const map = create_map_data(8, 8, 1)
    expect(wrap_cell(map, -1, 3)).toEqual({ q: 7, r: 3 })
    expect(wrap_cell(map, 8, 0)).toEqual({ q: 0, r: 0 })
    expect(wrap_cell(map, 5, 6)).toEqual({ q: 5, r: 6 })
  })

  it('is_in_bounds 两极约束 q 环绕恒合法', () => {
    const map = create_map_data(8, 4, 1)
    expect(is_in_bounds(map, 0, 0)).toBe(true)
    expect(is_in_bounds(map, 7, 3)).toBe(true)
    expect(is_in_bounds(map, -1, 0)).toBe(true)
    expect(is_in_bounds(map, 8, 0)).toBe(true)
    expect(is_in_bounds(map, 100, 2)).toBe(true)
    expect(is_in_bounds(map, 0, -1)).toBe(false)
    expect(is_in_bounds(map, 0, 4)).toBe(false)
  })

  it('terrain_code_to_type 地形码映射', () => {
    expect(terrain_code_to_type(TERRAIN_CODE_PLAIN)).toBe(TERRAIN_PLAIN)
    expect(terrain_code_to_type(TERRAIN_CODE_OCEAN)).toBe(TERRAIN_OCEAN)
    expect(terrain_code_to_type(TERRAIN_CODE_RIVER)).toBe(TERRAIN_RIVER)
    expect(TERRAIN_CODE_PLAIN).toBe(0)
    expect(TERRAIN_CODE_OCEAN).toBe(1)
    expect(TERRAIN_CODE_RIVER).toBe(2)
  })
})
