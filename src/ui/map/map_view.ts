import {
  MapData,
  AxialCoord,
  PixelCoord,
  TerrainType,
  sphere_project,
  sphere_spread,
  chunk_of,
  chunk_cells,
  hex_corners,
  terrain_at,
  TERRAIN_PLAIN,
  TERRAIN_OCEAN,
  TERRAIN_RIVER
} from '../../map'

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TERRAIN_PLAIN]: '#7ab648',
  [TERRAIN_OCEAN]: '#3f7fc4',
  [TERRAIN_RIVER]: '#5fb3e8'
}

export interface HexRenderer {
  draw_hex(center: PixelCoord, corners: PixelCoord[], color: string): void
}

export interface ViewTransform {
  scale: number
  offset_x: number
  offset_y: number
}

export const MIN_SCALE = 0.25
export const MAX_SCALE = 8
export const HEX_RENDER_SIZE = 12

export class MapView {
  private transform: ViewTransform = { scale: 1, offset_x: 0, offset_y: 0 }
  private map: MapData

  constructor(map: MapData) {
    this.map = map
  }

  get_transform(): ViewTransform {
    return { ...this.transform }
  }

  pan(dx: number, dy: number): void {
    this.transform.offset_x += dx
    this.transform.offset_y += dy
  }

  zoom(factor: number, anchor_x: number, anchor_y: number): void {
    const next = clamp(this.transform.scale * factor, MIN_SCALE, MAX_SCALE)
    const ratio = next / this.transform.scale
    this.transform.offset_x = anchor_x - (anchor_x - this.transform.offset_x) * ratio
    this.transform.offset_y = anchor_y - (anchor_y - this.transform.offset_y) * ratio
    this.transform.scale = next
  }

  world_to_screen(coord: AxialCoord, shift: number = 0): PixelCoord {
    const world = sphere_project(coord.q + shift, coord.r, this.map.width, this.map.height, HEX_RENDER_SIZE)
    return {
      x: world.x * this.transform.scale + this.transform.offset_x,
      y: world.y * this.transform.scale + this.transform.offset_y
    }
  }

  render(renderer: HexRenderer, view_width: number, view_height: number): number {
    let drawn = 0
    const visited = new Set<number>()
    const shifts = [-this.map.width, 0, this.map.width]
    const map_span = this.map.width * this.map.height
    for (let cr = 0; cr < this.map.chunk_rows; cr++) {
      for (let cq = 0; cq < this.map.chunk_cols; cq++) {
        const cells = chunk_cells({ q: cq, r: cr })
        for (const shift of shifts) {
          if (!chunk_visible(this, cells, shift, view_width, view_height)) {
            continue
          }
          for (const cell of cells) {
            if (cell.q >= this.map.width || cell.r >= this.map.height) {
              continue
            }
            const key = (shift + this.map.width) * map_span + cell.r * this.map.width + cell.q
            if (visited.has(key)) {
              continue
            }
            visited.add(key)
            const center = this.world_to_screen(cell, shift)
            const spread = sphere_spread(cell.r, this.map.height)
            const corners = hex_corners(center, HEX_RENDER_SIZE * this.transform.scale).map(corner => ({
              x: center.x + (corner.x - center.x) * spread,
              y: corner.y
            }))
            renderer.draw_hex(center, corners, TERRAIN_COLORS[terrain_at(this.map, cell.q, cell.r)])
            drawn++
          }
        }
      }
    }
    return drawn
  }
}

function chunk_visible(view: MapView, cells: AxialCoord[], shift: number, view_width: number, view_height: number): boolean {
  for (const cell of cells) {
    const screen = view.world_to_screen(cell, shift)
    const radius = HEX_RENDER_SIZE * view.get_transform().scale
    if (screen.x + radius >= 0 && screen.x - radius <= view_width && screen.y + radius >= 0 && screen.y - radius <= view_height) {
      return true
    }
  }
  return false
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
