import { describe, expect, it } from 'vitest'
import {
  HEX_CHUNK_SIZE,
  axial_to_pixel,
  pixel_to_axial,
  axial_round,
  axial_distance,
  axial_neighbors,
  chunk_of,
  chunk_cells,
  hex_corners,
  wrap_q,
  sphere_project,
  sphere_spread
} from './hex_grid'

describe('hex_grid', () => {
  it('axial_to_pixel 原点与偏移', () => {
    const origin = axial_to_pixel({ q: 0, r: 0 }, 1)
    expect(origin.x).toBeCloseTo(0, 10)
    expect(origin.y).toBeCloseTo(0, 10)
    const point = axial_to_pixel({ q: 1, r: 1 }, 2)
    expect(point.x).toBeCloseTo(2 * Math.sqrt(3) * 1.5, 10)
    expect(point.y).toBeCloseTo(3, 10)
  })

  it('axial_to_pixel 与 pixel_to_axial 往返一致', () => {
    const coords = [
      { q: 0, r: 0 },
      { q: 3, r: -2 },
      { q: -4, r: 5 },
      { q: 7, r: 7 },
      { q: -1, r: -6 }
    ]
    for (const coord of coords) {
      const pixel = axial_to_pixel(coord, 2.5)
      const back = pixel_to_axial(pixel.x, pixel.y, 2.5)
      expect(back.q).toBe(coord.q)
      expect(back.r).toBe(coord.r)
    }
  })

  it('axial_round 就近取整并修正分量', () => {
    expect(axial_round(1.2, -3.4)).toEqual({ q: 1, r: -3 })
    expect(axial_round(-2.6, 1.4)).toEqual({ q: -3, r: 2 })
    expect(axial_round(0.4, 0.4)).toEqual({ q: 0, r: 1 })
  })

  it('axial_distance 距离对称', () => {
    expect(axial_distance({ q: 0, r: 0 }, { q: 1, r: -3 })).toBe(3)
    expect(axial_distance({ q: 1, r: -3 }, { q: 0, r: 0 })).toBe(3)
    expect(axial_distance({ q: 2, r: 2 }, { q: 2, r: 2 })).toBe(0)
    expect(axial_distance({ q: -1, r: 4 }, { q: 3, r: 1 })).toBe(4)
  })

  it('axial_neighbors 六个相邻且距离为 1', () => {
    const center = { q: 2, r: -1 }
    const neighbors = axial_neighbors(center)
    expect(neighbors.length).toBe(6)
    for (const neighbor of neighbors) {
      expect(axial_distance(center, neighbor)).toBe(1)
    }
    const unique = new Set(neighbors.map(item => `${item.q},${item.r}`))
    expect(unique.size).toBe(6)
  })

  it('chunk_of 按区块尺寸归块', () => {
    expect(chunk_of({ q: 3, r: 3 })).toEqual({ q: 0, r: 0 })
    expect(chunk_of({ q: 5, r: 5 })).toEqual({ q: 1, r: 1 })
    expect(chunk_of({ q: 4, r: 0 })).toEqual({ q: 1, r: 0 })
    expect(chunk_of({ q: 8, r: 12 })).toEqual({ q: 2, r: 3 })
  })

  it('chunk_cells 产出区块内全部单元', () => {
    const chunk = { q: 1, r: -1 }
    const cells = chunk_cells(chunk)
    expect(cells.length).toBe(HEX_CHUNK_SIZE * HEX_CHUNK_SIZE)
    for (const cell of cells) {
      expect(chunk_of(cell)).toEqual(chunk)
    }
  })

  it('hex_corners 六角且顶点距中心为 size', () => {
    const center = { x: 10, y: -5 }
    const corners = hex_corners(center, 3)
    expect(corners.length).toBe(6)
    for (const corner of corners) {
      expect(Math.hypot(corner.x - center.x, corner.y - center.y)).toBeCloseTo(3, 10)
    }
  })

  it('wrap_q 横向取模环绕', () => {
    expect(wrap_q(0, 8)).toBe(0)
    expect(wrap_q(7, 8)).toBe(7)
    expect(wrap_q(8, 8)).toBe(0)
    expect(wrap_q(17, 8)).toBe(1)
    expect(wrap_q(-1, 8)).toBe(7)
    expect(wrap_q(-9, 8)).toBe(7)
  })

  it('sphere_project 纬度收窄经线汇聚两极', () => {
    const width = 8
    const height = 9
    const size = 2
    const pole = sphere_project(2, 0, width, height, size)
    const equator = sphere_project(4, 4, width, height, size)
    expect(pole.x).toBeCloseTo(0, 10)
    expect(Math.abs(equator.x)).toBeGreaterThan(0)
    expect(Math.abs(equator.x)).toBeGreaterThan(Math.abs(sphere_project(4, 1, width, height, size).x))
  })

  it('sphere_project y 纵排随纬度线性', () => {
    const width = 8
    const height = 9
    const size = 2
    const step = sphere_project(0, 1, width, height, size).y - sphere_project(0, 0, width, height, size).y
    for (let r = 1; r < height; r++) {
      const diff = sphere_project(3, r, width, height, size).y - sphere_project(3, r - 1, width, height, size).y
      expect(diff).toBeCloseTo(step, 10)
    }
  })

  it('sphere_project 环绕接缝间距等比收窄', () => {
    const width = 8
    const height = 9
    const size = 2
    for (const r of [0, 2, 4, 6, 8]) {
      const left = sphere_project(0, r, width, height, size)
      const right = sphere_project(width, r, width, height, size)
      const spread = sphere_spread(r, height)
      expect(right.x - left.x).toBeCloseTo(Math.sqrt(3) * size * width * spread, 8)
      expect(right.y).toBeCloseTo(left.y, 10)
    }
  })

  it('sphere_spread 两极收窄至零赤道最大', () => {
    expect(sphere_spread(0, 9)).toBeCloseTo(0, 10)
    expect(sphere_spread(8, 9)).toBeCloseTo(0, 10)
    expect(sphere_spread(4, 9)).toBeCloseTo(1, 10)
  })
})
